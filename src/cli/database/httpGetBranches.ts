import type { Pool } from "pg";
import { asyncHandler } from "../middleware/asyncHandler";
import { protectBranchPermission } from "./httpGetBranch";
import type { DB_GIT_BRANCH, DB_GIT_BRANCH_PERMISSIONS } from "./types";
import { getUserConditions, getUserToken } from "./utils/auth";

export const branchesList = async (db: Pool, userConditions: string[]) => {
  const branches = (
    await db.query<DB_GIT_BRANCH & Pick<DB_GIT_BRANCH_PERMISSIONS, "permissions">>(
      `SELECT b."branch", b."commit", p."permissions"
       FROM "GIT_BRANCH" b
       INNER JOIN  (
         SELECT "branch", bit_or("permissions")::integer as "permissions"
         FROM "GIT_BRANCH_PERMISSIONS"
         WHERE "userCondition" = ANY ($1)
         GROUP BY "branch"
       ) AS p ON p."branch" = b."branch"`,
      [userConditions]
    )
  ).rows;
  return branches;
};

export const httpGetBranches = (db: Pool) => [
  asyncHandler(async (req, res) => {
    const branches = await branchesList(db, getUserConditions(getUserToken(req)));
    for (const branch of branches) {
      protectBranchPermission(branch);
    }
    res.send(branches);
  })
];
