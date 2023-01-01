import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const defaultUserName = process.env.TEST_MUSICOCIEL_USERNAME ?? "admin";
export const defaultPassword = process.env.TEST_MUSICOCIEL_PASSWORD ?? "admin";

export const login = async (page: Page, user = defaultUserName, password = defaultPassword) => {
  const loginButton = page.getByTitle("Login");
  await loginButton.click();
  await expect(page).toHaveURL(/\/realms\//);
  await page.fill('input[name="username"]', user);
  await page.fill('input[name="password"]', password);
  const tokenRequestPromise = page.waitForRequest(/\/protocol\/openid-connect\/token$/);
  await Promise.all([page.waitForNavigation({ url: "." }), page.press('input[name="password"]', "Enter")]);
  const jsonToken = await (await (await tokenRequestPromise).response())?.json();
  await expect(loginButton).not.toBeVisible();
  const loggedInUserMenuButton = page.getByTitle("Logged in");
  await expect(loggedInUserMenuButton).toBeVisible();
  await expect(jsonToken.token_type).toEqual("Bearer");
  return jsonToken;
};

export const logout = async (page: Page) => {
  const loginButton = page.getByTitle("Login");
  const loggedInUserMenuButton = page.getByTitle("Logged in");
  const logoutButton = page.getByText("Logout");
  await loggedInUserMenuButton.click();
  await logoutButton.click();
  await expect(logoutButton).not.toBeVisible();
  await expect(loginButton).toBeVisible();
};
