import { test as base } from "@playwright/test";
import { randomBytes } from "crypto";
import { login, defaultUserName, defaultPassword } from "./utils/login";

export const test = base.extend<{
  authCredentials: { username: string; password: string };
  authToken: { access_token: string };
  authorization: string;
  branch: string;
}>({
  authCredentials: { username: defaultUserName, password: defaultPassword },
  authToken: async ({ page, authCredentials }, use) => {
    test.skip(process.env.TEST_MUSICOCIEL_KEYCLOAK === "false");
    await page.goto(".");
    const token = await login(page, authCredentials.username, authCredentials.password);
    await use(token);
  },
  authorization: async ({ authToken }, use) => {
    await use(`Bearer ${authToken.access_token}`);
  },
  branch: async ({ authorization, request }, use) => {
    const name = `test-${randomBytes(32).toString("hex")}`;
    await request.post("./api/branches", { data: { name }, headers: { authorization }, failOnStatusCode: true });
    try {
      await use(name);
    } finally {
      await request.delete(`./api/branches/${name}`, { headers: { authorization }, failOnStatusCode: true });
    }
  }
});
