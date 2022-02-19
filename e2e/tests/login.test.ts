import { test } from "@playwright/test";
import { login } from "./utils/login";

test("should login", async ({ page }) => {
  test.skip(process.env.TEST_MUSICOCIEL_KEYCLOAK === "false");
  const user = process.env.TEST_MUSICOCIEL_USERNAME ?? "admin";
  const password = process.env.TEST_MUSICOCIEL_PASSWORD ?? "admin";

  await page.goto(".");
  await login(page, user, password);
});
