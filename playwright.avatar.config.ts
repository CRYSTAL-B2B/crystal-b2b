import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'system-avatar.spec.ts',
  timeout: 45000, expect: { timeout: 8000 }, workers: 1,
  reporter: 'line',
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3016', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', launchOptions: { args: ['--enable-unsafe-swiftshader'] } } },
    { name: 'webkit', use: { browserName: 'webkit' }, grepInvert: /shader compile/ },
  ],
});
