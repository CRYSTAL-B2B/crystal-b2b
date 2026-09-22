import { expect, test, type Page } from '@playwright/test';
const target = '[data-system-id="hero-profit"]';
const avatar = '.system-avatar';
async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator(avatar)).toHaveAttribute('data-assets', 'ready');
}
async function hover(page: Page) { await page.locator(target).hover(); }
async function actOnLock(page: Page, action: 'scroll' | 'hide' | 'context') {
  await page.evaluate(action => {
    const root = document.querySelector('.system-avatar')!;
    const observer = new MutationObserver(() => {
      if ((root as HTMLElement).dataset.state !== 'LOCK') return;
      observer.disconnect();
      if (action === 'scroll') window.scrollTo({ top: 1600, behavior: 'instant' });
      if (action === 'hide') {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
      }
      if (action === 'context') document.querySelector('canvas')!.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
      document.body.dataset.avatarTestAction = 'done';
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-state'] });
  }, action);
}


test('Hero keeps semantic copy, one target, and an unobstructed navigation', async ({ page }) => {
  await ready(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Маркетинг — это управляемая инвестиция в рост прибыли.');
  await expect(page.locator('.hero-supporting')).toHaveText('Строю B2B-маркетинг от спроса до выручки.');
  await expect(page.locator('[data-system-target]')).toHaveCount(1);
  await expect(page.locator('canvas.system-fx-canvas')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('canvas')).toHaveCSS('pointer-events', 'none');
  const a = (await page.locator(avatar).boundingBox())!;
  const h = (await page.locator('.site-header').boundingBox())!;
  expect(a.y).toBeGreaterThan(h.y + h.height);
  await page.getByRole('link', { name: 'Обсудить задачу' }).first().click();
  await expect(page).toHaveURL(/#contact$/);
});

test('dwell, full choreography, eye/DOM geometry, cooldown and session memory', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.evaluate(() => {
    const states: string[] = [];
    Object.assign(window, { avatarStates: states });
    new MutationObserver(records => { for (const record of records) if (record.oldValue) states.push(record.oldValue); states.push((document.querySelector('.system-avatar') as HTMLElement).dataset.state!); })
      .observe(document.querySelector('.system-avatar')!, { attributes: true, attributeOldValue: true, attributeFilter: ['data-state'] });
  });
  await hover(page);
  await expect(page.locator(target)).toHaveAttribute('data-system-scanned', 'true', { timeout: 20000 });
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'COOLDOWN');
  expect(await page.locator(target).evaluate(el => getComputedStyle(el).getPropertyValue('--system-reveal').trim())).toBe('0');
  const data = await page.locator('canvas').evaluate(el => ({ ...el.dataset }));
  const eye = (await page.locator('[data-eye-anchor]').boundingBox())!;
  const box = (await page.locator(target).boundingBox())!;
  const origin = data.origin!.split(',').map(Number), hit = data.target!.split(',').map(Number);
  expect(Math.abs(origin[0] - eye.x - .5)).toBeLessThan(1);
  expect(Math.abs(origin[1] - eye.y - .5)).toBeLessThan(1);
  expect(hit[0]).toBeGreaterThan(box.x); expect(hit[0]).toBeLessThan(box.x + box.width);
  expect(hit[1]).toBeGreaterThan(box.y); expect(hit[1]).toBeLessThan(box.y + box.height);
  expect(Number(data.dpr)).toBeLessThanOrEqual(1.75);
  const frames = data.frames;
  await page.waitForTimeout(500);
  await expect(page.locator('canvas')).toHaveAttribute('data-frames', frames!);
  const states = await page.evaluate(() => (window as unknown as { avatarStates: string[] }).avatarStates);
  expect(states).toEqual(expect.arrayContaining(['TRACK', 'ALERT', 'LOCK', 'CHARGE', 'SCAN', 'REVEAL', 'CONFIRM', 'COOLDOWN']));
  await page.reload(); await hover(page); await page.waitForTimeout(800);
  expect(await page.evaluate(() => sessionStorage.getItem('system-avatar:scans'))).toBe('1');
  expect(errors).toEqual([]);
});

test('brief proximity does not fire; scrolling offscreen cancels and backscroll recovers', async ({ page }) => {
  await ready(page); await hover(page); await page.mouse.move(1200, 50);
  await page.waitForTimeout(350); await expect(page.locator(target)).not.toHaveAttribute('data-system-scanned');
  await actOnLock(page, 'scroll'); await hover(page);
  await expect(page.locator('body')).toHaveAttribute('data-avatar-test-action', 'done', { timeout: 15000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-active', 'false');
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'IDLE');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await hover(page); await expect(page.locator(target)).toHaveAttribute('data-system-scanned', 'true');
});

test('reduced motion uses readable highlight without initializing WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await ready(page); await hover(page);
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'REDUCED_MOTION');
  await expect(page.locator(target)).toHaveAttribute('data-system-scanned', 'true');
  await expect(page.locator('canvas')).not.toHaveAttribute('data-engine');
});

test('WebGL unavailable preserves static portrait and functional DOM', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await ready(page); await hover(page);
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'DISABLED', { timeout: 15000 });
  await expect(page.locator(target)).toBeVisible();
  await expect(page.locator('.hero-actions .button')).toBeVisible();
});

for (const failure of ['manifest', 'atlas', 'state', 'idle', 'all-states'] as const) {
  test(`asset fallback: ${failure}`, async ({ page }) => {
    if (failure === 'manifest') await page.route('**/system-avatar/avatar-manifest.json', r => r.fulfill({ json: { broken: true } }));
    if (['atlas', 'state', 'idle', 'all-states'].includes(failure)) await page.route('**/system-avatar/atlas/**', r => r.fulfill({ status: 404, body: '' }));
    if (failure === 'state') await page.route('**/system-avatar/states/track-right.png', r => r.fulfill({ status: 404, body: '' }));
    if (failure === 'idle') await page.route('**/system-avatar/states/idle.png', r => r.fulfill({ status: 404, body: '' }));
    if (failure === 'all-states') await page.route('**/system-avatar/states/**', r => r.fulfill({ status: 404, body: '' }));
    await ready(page); await hover(page);
    await expect(page.locator(target)).toBeVisible();
    if (failure === 'idle' || failure === 'all-states') {
      await expect(page.locator(avatar)).toHaveAttribute('data-master', 'true');
      await expect(page.locator(avatar)).toHaveAttribute('data-state', 'DISABLED');
      await expect(page.locator('.system-avatar-base')).toHaveCSS('background-image', /avatar-master.png/);
    } else await expect(page.locator(target)).toHaveAttribute('data-system-scanned', 'true', { timeout: 20000 });
  });
}

test('mobile tap runs lite once; menu overlays avatar and returns focus', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const page = await context.newPage(); await ready(page);
  await expect(page.locator(avatar)).toHaveAttribute('data-mode', 'LITE');
  await page.locator(target).tap();
  await expect(page.locator(target)).toHaveAttribute('data-system-scanned', 'true', { timeout: 20000 });
  expect(Number(await page.locator('canvas').getAttribute('data-dpr'))).toBeLessThanOrEqual(1.25);
  await page.getByRole('button', { name: 'Меню' }).click();
  await expect(page.locator(avatar)).toBeHidden();
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Меню' })).toBeFocused();
  await context.close();
});

test('no JavaScript retains the complete Hero and CTA', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage(); await page.goto('/');
  await expect(page.locator(target)).toBeVisible(); await expect(page.locator('.hero-actions .button')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('управляемая инвестиция'); await context.close();
});

test('atlas is used after preload without shifting portrait geometry', async ({ page }) => {
  await ready(page);
  const before = await page.locator(avatar).boundingBox();
  await page.waitForTimeout(1800);
  await page.mouse.move(1100, 160);
  await expect(page.locator('.system-avatar-expression')).toHaveCSS('background-image', /avatar-atlas.png/);
  expect(await page.locator(avatar).boundingBox()).toEqual(before);
  await page.mouse.move(0, 160);
  await expect(page.locator(avatar)).toHaveAttribute('data-sprite', 'track-left');
  await page.mouse.move(1100, 160);
  await expect(page.locator(avatar)).toHaveAttribute('data-sprite', 'track-right');
});

test('context loss cancels FX and preserves content', async ({ page }) => {
  await ready(page); await actOnLock(page, 'context'); await hover(page);
  await expect(page.locator('body')).toHaveAttribute('data-avatar-test-action', 'done', { timeout: 15000 });
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'DISABLED');
  await expect(page.locator('canvas')).toHaveAttribute('data-active', 'false');
  await expect(page.locator(target)).toBeVisible();
});

test('resize during scan remeasures the eye and target', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await ready(page); await hover(page);
  await expect(page.locator(avatar)).toHaveAttribute('data-state', /LOCK|CHARGE|SCAN/, { timeout: 15000 });
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator(target)).toHaveAttribute('data-system-scanned', 'true');
  const targetData = (await page.locator('canvas').getAttribute('data-target'))!.split(',').map(Number);
  const rect = (await page.locator(target).boundingBox())!;
  expect(targetData[0]).toBeGreaterThan(rect.x); expect(targetData[0]).toBeLessThan(rect.x + rect.width);
  expect(targetData[1]).toBeGreaterThan(rect.y); expect(targetData[1]).toBeLessThan(rect.y + rect.height);
});

test('hidden tab cancels and visible tab recovers', async ({ page }) => {
  await ready(page); await actOnLock(page, 'hide'); await hover(page);
  await expect(page.locator('body')).toHaveAttribute('data-avatar-test-action', 'done', { timeout: 15000 });
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'SLEEP');
  await expect(page.locator('canvas')).toHaveAttribute('data-active', 'false');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'IDLE');
});

test('session scan budget prevents a seventh scan', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('system-avatar:scans', '6'));
  await ready(page); await hover(page); await page.waitForTimeout(600);
  await expect(page.locator('canvas')).not.toHaveAttribute('data-active', 'true');
  await expect(page.locator(target)).not.toHaveAttribute('data-system-scanned');
});

test('live reduced-motion changes cancel an active scan', async ({ page }) => {
  await ready(page); await hover(page);
  await expect(page.locator(avatar)).toHaveAttribute('data-state', /LOCK|CHARGE|SCAN/, { timeout: 15000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'REDUCED_MOTION');
  await expect(page.locator('canvas')).toHaveCSS('display', 'none');
  await expect(page.locator(target)).toBeVisible();
});

test('shader compile failure falls back without crashing the page', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    const source = WebGL2RenderingContext.prototype.shaderSource;
    WebGL2RenderingContext.prototype.shaderSource = function (shader, code) {
      source.call(this, shader, code.includes('uContactIntensity') ? `${code}\ninvalid_shader_token` : code);
    };
  });
  await ready(page); await hover(page);
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'DISABLED', { timeout: 15000 });
  await expect(page.locator(target)).toBeVisible(); expect(errors).toEqual([]);
});

test('corrupt image data falls back to idle after atlas failure', async ({ page }) => {
  await page.route('**/system-avatar/atlas/**', r => r.fulfill({ status: 404, body: '' }));
  await page.route('**/system-avatar/states/track-right.png', r => r.fulfill({ contentType: 'image/png', body: 'corrupt png data' }));
  await ready(page); await page.mouse.move(1100, 160);
  await expect(page.locator(avatar)).toHaveAttribute('data-sprite', 'track-right');
  await expect(page.locator('.system-avatar-expression')).toHaveCSS('background-image', /states\/idle.png/);
});

test('slow state decode cannot overwrite a newer direction', async ({ page }) => {
  await page.route('**/system-avatar/atlas/**', r => r.fulfill({ status: 404, body: '' }));
  await page.route('**/system-avatar/states/track-left.png', async route => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await route.continue();
  });
  await ready(page);
  await page.mouse.move(0, 160);
  await expect(page.locator(avatar)).toHaveAttribute('data-sprite', 'track-left');
  await page.mouse.move(1100, 160);
  await expect(page.locator(avatar)).toHaveAttribute('data-sprite', 'track-right');
  await page.waitForTimeout(1500);
  await expect(page.locator('.system-avatar-expression')).toHaveCSS('background-image', /states\/track-right.png/);
  await expect(page.locator('.hero-actions .button')).toBeVisible();
});

test('motion preference changed during manifest loading is respected at startup', async ({ page }) => {
  await page.route('**/system-avatar/avatar-manifest.json', async route => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(avatar)).toHaveAttribute('data-assets', 'ready');
  await expect(page.locator(avatar)).toHaveAttribute('data-state', 'REDUCED_MOTION');
  await expect(page.locator('canvas')).not.toHaveAttribute('data-engine');
});
