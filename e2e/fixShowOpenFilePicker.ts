import type { Page, BrowserContext } from "@playwright/test";

// cf https://github.com/microsoft/playwright/issues/8850
export const fixShowOpenFilePicker = async (page: Page | BrowserContext) => {
  await page.addInitScript("window.showOpenFilePicker = null;");
};
