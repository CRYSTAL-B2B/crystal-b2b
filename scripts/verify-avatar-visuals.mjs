// Run against the isolated production preview; never submits a real lead.
import { chromium, firefox, webkit } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3016';
const output = path.resolve('output/avatar-qa');
(async () => {
 fs.mkdirSync(output, { recursive: true });
 const report = [];
 const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
 const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto(baseURL); await page.waitForSelector('[data-assets=ready]');
 await page.screenshot({ path: path.join(output, 'desktop-idle.png') });
 await page.locator('[data-system-target]').hover();
 await page.waitForFunction(() => Number(document.querySelector('canvas').dataset.progress) > .65);
 await page.screenshot({ path: path.join(output, 'desktop-scan.png') });
 await page.waitForSelector('[data-system-scanned=true]');
 await page.waitForTimeout(600);
 await page.screenshot({ path: path.join(output, 'desktop-reveal.png') });
 report.push({ name: 'chromium', canvas: await page.locator('canvas').evaluate(el => ({ ...el.dataset })), errors });
 for (const zoom of [1.25, 1.5]) {
  await page.evaluate(value => { document.documentElement.style.zoom = String(value); }, zoom);
  await page.waitForTimeout(150);
  const boxes = await page.evaluate(() => {
   const eye = document.querySelector('[data-eye-anchor]').getBoundingClientRect();
   const target = document.querySelector('[data-system-target]').getBoundingClientRect();
   return { overflow: document.documentElement.scrollWidth > innerWidth, eye: eye.toJSON(), target: target.toJSON(), width: innerWidth };
  });
  if (boxes.target.right > boxes.width || boxes.overflow) throw new Error(`Zoom overflow: ${zoom}`);
  report.push({ name: `layout-zoom-${zoom}`, ...boxes });
  await page.screenshot({ path: path.join(output, `zoom-${zoom}.png`) });
 }
 await page.evaluate(() => { document.documentElement.style.zoom = ''; });
 await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(150);
 await page.screenshot({ path: path.join(output, 'mobile.png') });
 // Deterministic UI-only failure scenario: no external CAPTCHA or delivery.
 await page.route('**/api/lead', route => route.fulfill({ status: 503, json: { message: 'Канал отправки ещё настраивается. Пожалуйста, попробуйте позже.' } }));
 await page.route('https://challenges.cloudflare.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
 await page.locator('#contact').scrollIntoViewIfNeeded();
 await page.getByLabel(/^Имя/).fill('Тест Hero');
 await page.getByLabel(/^Номер телефона/).fill('+7 999 123-45-67');
 await page.locator('form').evaluate(form => { const input = document.createElement('input'); input.type = 'hidden'; input.name = 'cf-turnstile-response'; input.value = 'local-test'; form.append(input); });
 await page.getByRole('button', { name: 'Обсудить задачу' }).last().click();
 await page.getByText('Канал отправки ещё настраивается. Пожалуйста, попробуйте позже.').waitFor();
 if (await page.getByLabel(/^Имя/).inputValue() !== 'Тест Hero') throw new Error('Form cleared after failure');
 report.push({ name: 'form-mocked-503', passed: true });
 await browser.close();
 for (const [name, type] of Object.entries({ firefox, webkit })) {
  const b = await type.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(baseURL); await p.waitForSelector('[data-assets=ready]'); await p.locator('[data-system-target]').hover(); await p.waitForTimeout(5500);
  report.push({ name, state: await p.locator('.system-avatar').getAttribute('data-state'), errors });
  await p.screenshot({ path: path.join(output, `${name}.png`) }); await b.close();
 }
 fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
 console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
