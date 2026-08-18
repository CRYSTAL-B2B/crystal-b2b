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
        command: "npm run start -- -p 3011",
        url: "http://127.0.0.1:3011",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
