import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3004",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "npm run dev",
      url: "http://localhost:3004",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npx tsx ../api/src/index.ts",
      url: "http://127.0.0.1:4000/api/health",
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
