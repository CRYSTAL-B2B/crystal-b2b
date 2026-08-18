import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseURL = process.argv[2] || "http://127.0.0.1:3011";
const output = process.argv[3] || "qa-artifacts";
await mkdir(output, { recursive: true });

const browser = await chromium.launch();

async function capture(name, viewport, reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport, reducedMotion });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${output}/${name}-hero.png` });

  const scenes = [
    ["process", ".process-scene", 0.52],
    ["flow", ".flow-scene", 0.54],
    ["architecture", ".architecture-scene", 0.58],
    ["lighthouse", ".lighthouse-scene", 0.62],
  ];

  for (const [sceneName, selector, fraction] of scenes) {
    await page.locator(selector).evaluate((section, value) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const span = section.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + span * Number(value), behavior: "instant" });
    }, fraction);
    await page.waitForTimeout(reducedMotion === "reduce" ? 250 : 900);
    await page.screenshot({ path: `${output}/${name}-${sceneName}.png` });
  }

  await page.locator("#results").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${output}/${name}-proof.png` });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${output}/${name}-contact.png` });
  await context.close();
}

await capture("desktop", { width: 1440, height: 900 });
await capture("mobile", { width: 390, height: 844 });
await capture("reduced", { width: 1440, height: 900 }, "reduce");

await browser.close();
