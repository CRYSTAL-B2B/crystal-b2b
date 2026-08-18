import { defineConfig } from "@playwright/test";

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: remoteBaseUrl ?? "http://127.0.0.1:3011",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: remoteBaseUrl
    ? undefined
    : {
        // Static export has no server to start — build first, then serve
        // the exported `out/` directory as plain files (matches what
        // GitHub Pages actually does).
        command: "npm run build && npx serve out -l 3011",
        url: "http://127.0.0.1:3011",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
