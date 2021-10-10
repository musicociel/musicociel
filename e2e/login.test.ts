import { test, expect } from "@playwright/test";

test("should login", async ({ page, baseURL }) => {
  test.skip(process.env.TEST_MUSICOCIEL_KEYCLOAK === "false");
  const user = process.env.TEST_MUSICOCIEL_USERNAME ?? "admin";
  const password = process.env.TEST_MUSICOCIEL_PASSWORD ?? "admin";

  await page.goto(".");
  const loginButton = page.locator("button[title=Login]");
  await loginButton.click();
  await expect(page).toHaveURL(/\/auth\/realms\//);
  await page.fill('input[name="username"]', user);
  await page.fill('input[name="password"]', password);
  await Promise.all([page.waitForNavigation({ url: baseURL }), page.press('input[name="password"]', "Enter")]);
  await expect(loginButton).not.toBeVisible();
});
