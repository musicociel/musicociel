import { test } from "./baseTest";
import { login, logout } from "./utils/login";

test("should login and logout", async ({ page, authCredentials }) => {
  test.skip(process.env.TEST_MUSICOCIEL_KEYCLOAK === "false");
  await page.goto(".");
  await login(page, authCredentials.username, authCredentials.password);
  await logout(page);
});
