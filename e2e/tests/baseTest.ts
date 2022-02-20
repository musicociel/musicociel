import { test as base } from "@playwright/test";
import { randomBytes } from "crypto";
import { login, defaultUserName, defaultPassword } from "./utils/login";

export const test = base.extend<{
  authCredentials: { username: string; password: string };
  authToken: { access_token: string };
  authorization: string;
  library: string;
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
  library: async ({ authorization, request }, use) => {
    const library = `test-${randomBytes(32).toString("hex")}`;
    await request.post("./api/libraries", { data: { library }, headers: { authorization }, failOnStatusCode: true });
    try {
      await use(library);
    } finally {
      await request.delete(`./api/libraries/${library}`, { headers: { authorization }, failOnStatusCode: true });
    }
  }
});
