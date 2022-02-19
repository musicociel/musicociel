import { expect, Page } from "@playwright/test";

export const login = async (page: Page, user: string, password: string) => {
  const loginButton = page.locator("button[title=Login]");
  await loginButton.click();
  await expect(page).toHaveURL(/\/auth\/realms\//);
  await page.fill('input[name="username"]', user);
  await page.fill('input[name="password"]', password);
  await Promise.all([page.waitForNavigation({ url: "." }), page.press('input[name="password"]', "Enter")]);
  await expect(loginButton).not.toBeVisible();
};
