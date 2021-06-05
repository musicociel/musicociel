import { chromium, Browser, Page } from "playwright";
export let browser: Browser;
export let page: Page;
export const musicocielURL = process.env.TEST_MUSICOCIEL_URL!;
if (!musicocielURL) {
  throw new Error("Missing TEST_MUSICOCIEL_URL");
}

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage({
    locale: "en-US"
  });
});

afterEach(async () => {
  await page.close();
});
