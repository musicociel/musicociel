import { join } from "path";
import type { PlaywrightTestConfig } from "@playwright/test";

export const musicocielURL = process.env.TEST_MUSICOCIEL_URL!;

if (!musicocielURL) {
  throw new Error("Missing TEST_MUSICOCIEL_URL");
}

const config: PlaywrightTestConfig = {
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  outputDir: join(__dirname, "test-results"),
  use: {
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure"
  }
};
export default config;
