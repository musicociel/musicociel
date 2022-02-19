import { expect } from "@playwright/test";
import { Permissions } from "../../../src/common/storage/permissions";
import { test } from "../baseTest";

test("branch", async ({ branch, request, authorization }) => {
  const branchInfo = await (await request.get(`./api/branches/${branch}`, { headers: { authorization }, failOnStatusCode: true })).json();
  expect.soft(branchInfo).toEqual({ branch, commit: null, permissions: Permissions.Admin });
  const branches = await (await request.get("./api/branches", { headers: { authorization }, failOnStatusCode: true })).json();
  expect.soft(branches).toContainEqual(branchInfo);
});
