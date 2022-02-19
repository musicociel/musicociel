import { test } from "./baseTest";
import { login } from "./utils/login";

test("should login", async ({ page, authCredentials }) => {
  test.skip(process.env.TEST_MUSICOCIEL_KEYCLOAK === "false");
  await page.goto(".");
  await login(page, authCredentials.username, authCredentials.password);
});
