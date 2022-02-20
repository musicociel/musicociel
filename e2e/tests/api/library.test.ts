import { expect } from "@playwright/test";
import { Permissions } from "../../../src/common/storage/permissions";
import { test } from "../baseTest";

test("library", async ({ library, request, authorization }) => {
  const libraryInfo = await (await request.get(`./api/libraries/${library}`, { headers: { authorization }, failOnStatusCode: true })).json();
  expect.soft(libraryInfo).toEqual({ library, commit: null, permissions: Permissions.Admin });
  const libraries = await (await request.get("./api/libraries", { headers: { authorization }, failOnStatusCode: true })).json();
  expect.soft(libraries).toContainEqual(libraryInfo);
});

test("refuses invalid library names", async ({ request, authorization }) => {
  const res = await request.post(`./api/libraries`, { headers: { authorization }, data: { library: "" } });
  expect.soft(res.status()).toBe(400);
  const resJson = await res.json();
  expect.soft(resJson.message).toContain("Invalid request");
});
