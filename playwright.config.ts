import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: /.*\.spec\.ts/, timeout: 15000, reporter: 'list', workers: 1,
  use: { baseURL: 'http://localhost:4173', headless: false, launchOptions: { slowMo: 400 } },
  webServer: { command: 'npm run serve', url: 'http://localhost:4173', reuseExistingServer: true },
});
