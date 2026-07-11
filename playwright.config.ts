import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: "line",
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
    viewport: { width: 1920, height: 1080 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "corepack pnpm exec next dev -p 3100",
    url: "http://localhost:3100/demo?test=1",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
