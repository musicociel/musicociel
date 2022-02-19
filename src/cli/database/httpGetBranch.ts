import type { Pool, PoolClient } from "pg";
import { asyncHandler } from "../middleware/asyncHandler";
import type { DB_GIT_BRANCH, DB_GIT_BRANCH_PERMISSIONS } from "./types";
import { getUserConditions, getUserToken } from "./utils/auth";
import { NotFound } from "http-errors";
import { Permissions } from "../../common/storage/permissions";

export const protectBranchPermission = (info: DB_GIT_BRANCH & Pick<DB_GIT_BRANCH_PERMISSIONS, "permissions">) => {
  if (!(info.permissions & Permissions.ReadContent)) {
    info.commit = null;
  }
};

export const getBranchInfo = async (db: Pool | PoolClient, userConditions: string[], branch: string) => {
  const [branchInfo] = (
    await db.query<DB_GIT_BRANCH & Pick<DB_GIT_BRANCH_PERMISSIONS, "permissions">>(
      `SELECT b."branch", b."commit", p."permissions"
       FROM "GIT_BRANCH" b
       INNER JOIN (
         SELECT "branch", bit_or("permissions")::integer as "permissions"
         FROM "GIT_BRANCH_PERMISSIONS"
         WHERE "userCondition" = ANY ($1) AND branch = $2
         GROUP BY "branch"
       ) AS p ON p."branch" = b."branch"`,
      [userConditions, branch]
    )
  ).rows;
  if (!branchInfo) {
    throw new NotFound();
  }
  return branchInfo;
};

export const httpGetBranch = (db: Pool) => [
  asyncHandler(async (req, res) => {
    const { branch } = req.params;
    const branchInfo = await getBranchInfo(db, getUserConditions(getUserToken(req)), branch);
    protectBranchPermission(branchInfo);
    res.send(branchInfo);
  })
];
