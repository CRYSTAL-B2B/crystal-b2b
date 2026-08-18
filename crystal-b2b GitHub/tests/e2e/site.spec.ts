import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const viewports = [
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

test("основная страница загружается без runtime-ошибок", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Строю B2B-маркетинг");
  await expect(page.locator(".scroll-scene[data-motion-ready='true']")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Давайте определим курс." })).toBeVisible();
  expect(errors).toEqual([]);
});

test("верхняя навигация использует имя, системный grotesk и обычные дефисы", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const header = page.locator(".site-header");
  await expect(page.getByRole("link", { name: /Даниил Чекулаев - в начало страницы/ })).toBeVisible();
  await expect(header).toHaveAttribute("data-scrolled", "false");

  const eyebrowSize = await page.locator(".hero .eyebrow").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  const microSize = await page.locator(".section-label").first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  expect(eyebrowSize / microSize).toBeCloseTo(1.5, 1);

  const desktopNavSize = await page.locator(".desktop-nav").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  expect(desktopNavSize).toBeGreaterThanOrEqual(15);

  const formLabelColors = await page.locator(".contact-form .form-field:not(.honeypot) label").evaluateAll(
    (labels) => labels.map((label) => getComputedStyle(label).color),
  );
  expect(formLabelColors).toEqual(["rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"]);

  const visibleText = await page.locator("body").innerText();
  expect(visibleText).not.toMatch(/[\u2014\u2192]/);
  expect(await page.title()).not.toMatch(/\u2014/);

  await page.evaluate(() => window.scrollTo({ top: 64, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-scrolled", "true");
});

test("на desktop колёсико прокручивает страницу плавно с инерцией", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-smooth-scroll", "inertial");

  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(50);
  const earlyPosition = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(250);
  const settledPosition = await page.evaluate(() => window.scrollY);

  expect(earlyPosition).toBeGreaterThan(0);
  expect(settledPosition).toBeGreaterThan(earlyPosition);
});

test("инерционная прокрутка не включается на mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("html")).not.toHaveAttribute("data-smooth-scroll");
});

test("desktop Hero сдвинут вправо без рассинхронизации poster и video", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const heroOffset = await page.locator(".hero-media").evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--hero-media-offset-x").trim(),
  );
  expect(heroOffset).toBe("8px");
});

test("выбранные animation overlays отключены", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator(".flow-visual")).toHaveCSS("display", "none");
  await expect(page.locator(".system-processes-map")).toHaveCSS("display", "none");
  await expect(page.locator(".architecture-trace-map")).toHaveCSS("display", "none");
});

test("утверждённые ролики усиливают desktop-сцены", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const heroVideo = page.locator("video.hero-video");
  await expect(heroVideo).toHaveAttribute("src", "/media/video/01-hero.mp4");
  await expect(heroVideo).toHaveAttribute("data-ready", "true");

  for (const [scene, video, source] of [
    [".flow-scene", ".flow-video", "/media/video/03-control-flow.mp4"],
    [".architecture-scene", ".architecture-video", "/media/video/04-connected-system.mp4"],
  ] as const) {
    await page.locator(scene).scrollIntoViewIfNeeded();
    await expect(page.locator(video)).toHaveAttribute("src", source);
    await expect(page.locator(video)).toHaveAttribute("data-ready", "true");
  }
});

test("на mobile утверждённые ролики работают по тому же принципу", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });

  const heroVideo = page.locator("video.hero-video");
  await expect(heroVideo).toHaveAttribute("src", "/media/video/01-hero.mp4");
  await expect(heroVideo).toHaveAttribute("data-ready", "true");

  for (const [scene, video, source] of [
    [".flow-scene", ".flow-video", "/media/video/03-control-flow.mp4"],
    [".architecture-scene", ".architecture-video", "/media/video/04-connected-system.mp4"],
  ] as const) {
    await page.locator(scene).scrollIntoViewIfNeeded();
    await expect(page.locator(video)).toHaveAttribute("src", source);
    await expect(page.locator(video)).toHaveAttribute("data-ready", "true");
  }

  await context.close();
});

test("Control the Flow не меняет положение видео при прокрутке", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const seek = async (progress: number) => {
    await page.locator(".flow-scene").evaluate((element, value) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(element.clientHeight - window.innerHeight, 0);
      window.scrollTo({ top: top + distance * Number(value), behavior: "instant" });
    }, progress);
    await page.waitForTimeout(300);
  };

  await seek(0.12);
  await expect(page.locator(".flow-video-media")).toHaveCSS("transform", "none");
  const crawlAtStart = await page.locator(".flow-crawl").evaluate((element) => getComputedStyle(element).transform);
  await seek(0.82);
  await expect(page.locator(".flow-video-media")).toHaveCSS("transform", "none");
  const crawlAtEnd = await page.locator(".flow-crawl").evaluate((element) => getComputedStyle(element).transform);
  expect(crawlAtStart).not.toBe("none");
  expect(crawlAtEnd).not.toBe(crawlAtStart);
});

test("все пользовательские подписи в абзацах переведены на русский", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const paragraphText = (await page.locator("p").allInnerTexts()).join("\n");
  expect(paragraphText).toContain("B2B-МАРКЕТИНГ / CRM / РОСТ");
  expect(paragraphText).toContain("Не обязательно закупать больше трафика.");
  expect(paragraphText).not.toMatch(/Control the Flow|Economic thesis|Scroll to explore|SIX LAYERS|STABLE SIGNAL|GROWTH/i);
});

for (const viewport of viewports) {
  test(`${viewport.width}×${viewport.height}: нет горизонтального переполнения`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("визуал System - Processes остаётся закреплённым при прокрутке списка", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const section = page.locator(".process-scene");
  const sticky = page.locator(".system-processes-sticky");
  await expect(page.locator(".system-processes-item")).toHaveCount(8);
  await expect(sticky).toHaveCSS("position", "sticky");

  const sampleAt = async (offset: number) => {
    await section.evaluate((element, value) => {
      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: sectionTop + Number(value), behavior: "instant" });
    }, offset);
    await page.waitForTimeout(250);
    return sticky.evaluate((element) => element.getBoundingClientRect().top);
  };

  const first = await sampleAt(650);
  const second = await sampleAt(1_150);
  expect(Math.abs(first - second)).toBeLessThan(2);
});

test("System - Processes переводит систему в связанные процессы по мере прокрутки", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const section = page.locator(".process-scene");
  await expect(section.locator(".system-processes-map path")).toHaveCount(8);
  await expect(section.locator(".system-processes-node")).toHaveCount(8);

  await page.locator(".system-processes-item").last().evaluate((element) => {
    element.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(350);
  await expect(section).toHaveAttribute("data-system-state", "connected");
  await expect(section.locator(".system-processes-map path[data-complete='true']")).toHaveCount(8);
});

test("Flow, Lighthouse и trace controls меняют видимое состояние", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const seek = async (selector: string, progress: number) => {
    await page.locator(selector).evaluate((element, value) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(element.clientHeight - window.innerHeight, 0);
      window.scrollTo({ top: top + distance * Number(value), behavior: "instant" });
    }, progress);
    await page.waitForTimeout(500);
  };

  await seek(".flow-scene", 0.62);
  await expect(page.locator(".flow-scene")).toHaveAttribute("data-flow-state", "output");
  await expect(page.locator(".flow-route")).toHaveCount(4);

  await seek(".lighthouse-scene", 0.62);
  await expect(page.locator(".lighthouse-scene")).toHaveAttribute("data-lighthouse-state", "course");
  await expect(page.locator(".beacon-course-line")).toHaveCount(1);

  const trace = page.getByRole("button", { name: /Путь контента/ });
  await trace.click();
  const camera = page.locator(".architecture-camera");
  await expect(camera).toHaveAttribute("data-trace", "content");
  await page.waitForTimeout(850);
  await expect(camera.locator(".architecture-trace[data-route='content']")).toHaveCSS("opacity", "1");
  await expect(page.locator(".trace-status")).toContainText("КОНТЕНТ - СПРОС - ПОСАДОЧНАЯ СТРАНИЦА - ЛИД - CRM - ПРОДАЖИ");
});

test("reduced motion показывает полное статическое состояние", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".scroll-scene[data-motion-ready='true']")).toHaveCount(0);
  await expect(page.locator(".flow-static-summary")).toBeVisible();
  await expect(page.locator(".beacon-static-summary")).toBeVisible();
  await expect(page.getByText("Одна работающая система.")).toBeVisible();
  await expect(page.locator("video[src]")).toHaveCount(0);
  await context.close();
});

test("мобильное меню закрывается по Escape с возвратом фокуса", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const menuButton = page.getByRole("button", { name: "Меню" });
  await menuButton.click();
  await expect(page.getByRole("navigation", { name: "Мобильная навигация" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Мобильная навигация" })).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test("кнопка mobile-меню закреплена у правого края header", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const rightInset = await page.getByRole("button", { name: "Меню" }).evaluate((element) =>
    window.innerWidth - element.getBoundingClientRect().right,
  );
  expect(rightInset).toBeCloseTo(16, 0);
});

test("переключатель типографики применяет и сохраняет выбранную шкалу", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const calm = page.getByRole("button", { name: /Тихая:/ });
  const editorial = page.getByRole("button", { name: /Акцент:/ });
  await expect(calm).toHaveAttribute("aria-pressed", "true");

  const calmSize = await page.locator(".hero h1").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  await editorial.click();
  await expect(page.locator("html")).toHaveAttribute("data-typography", "editorial");
  const editorialSize = await page.locator(".hero h1").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  expect(editorialSize).toBeGreaterThan(calmSize);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-typography", "editorial");
  await expect(page.getByRole("button", { name: /Акцент:/ })).toHaveAttribute("aria-pressed", "true");
});

test("форма валидирует поля и честно сообщает об отсутствующем delivery endpoint", async ({ page }) => {
  await page.goto("/#contact", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Обсудить задачу" }).last().click();
  await expect(page.getByText("Проверьте обязательные поля.")).toBeVisible();

  await page.getByLabel(/^Имя/).fill("Анна");
  await page.getByLabel(/^Номер телефона/).fill("+7 999 123-45-67");
  await page.getByLabel("Задача").fill("Нужна CRM-стратегия");
  await expect(page.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", { timeout: 15_000 });
  await page.getByRole("button", { name: "Обсудить задачу" }).last().click();
  await expect(page.getByText("Канал отправки ещё настраивается. Пожалуйста, попробуйте позже.")).toBeVisible();
  await expect(page.getByLabel(/^Имя/)).toHaveValue("Анна");
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name}: нет серьёзных WCAG-нарушений`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blockingViolations = results.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    );

    expect(
      blockingViolations.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map(({ failureSummary, target }) => ({ failureSummary, target })),
      })),
    ).toEqual([]);
  });
}
