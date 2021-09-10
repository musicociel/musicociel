import { join } from "path";
import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 30000,
  retries: 5,
  forbidOnly: !!process.env.CI,
  outputDir: join(__dirname, "test-results"),
  webServer: process.env.TEST_MUSICOCIEL_URL
    ? undefined
    : {
        command: "npm start",
        port: 8081,
        reuseExistingServer: !process.env.CI
      },
  use: {
    baseURL: process.env.TEST_MUSICOCIEL_URL || "http://127.0.0.1:8081",
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "Chromium",
      use: {
        browserName: "chromium"
      }
    },
    {
      name: "Firefox",
      use: {
        browserName: "firefox"
      }
    }
  ]
};
export default config;
