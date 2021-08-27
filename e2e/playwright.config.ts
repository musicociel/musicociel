import { join } from "path";
import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 30000,
  retries: 5,
  forbidOnly: !!process.env.CI,
  outputDir: join(__dirname, "test-results"),
  use: {
    baseURL: process.env.TEST_MUSICOCIEL_URL || "http://127.0.0.1:8081",
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure"
  }
};
export default config;
