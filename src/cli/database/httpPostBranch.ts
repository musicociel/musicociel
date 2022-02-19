import type { Pool } from "pg";
import { Permissions, permissionToBitString } from "../../common/storage/permissions";
import { validate, Schema } from "../middleware/errorHandler";
import { asyncHandler } from "../middleware/asyncHandler";
import type { DB_GIT_BRANCH, DB_GIT_BRANCH_PERMISSIONS } from "./types";
import { json } from "body-parser";
import { getUserToken } from "./utils/auth";

export const branchCreate = async (
  dbPool: Pool,
  branch: string,
  userTokenContent: any
): Promise<Pick<DB_GIT_BRANCH & DB_GIT_BRANCH_PERMISSIONS, "branch" | "commit" | "permissions">> => {
  const db = await dbPool.connect();
  try {
    const permissions = Permissions.Admin;
    await db.query(`BEGIN`);
    await db.query(`INSERT INTO "GIT_BRANCH" ("branch", "commit") VALUES ($1, NULL)`, [branch]);
    await db.query(`INSERT INTO "GIT_BRANCH_PERMISSIONS" ("branch", "userCondition", "permissions") VALUES ($1, $2, $3)`, [
      branch,
      `user-uuid:${userTokenContent.sub}`,
      permissionToBitString(permissions)
    ]);
    await db.query("COMMIT");
    return {
      branch,
      commit: null,
      permissions
    };
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    db.release();
  }
};

const bodySchema: Schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" }
  }
};

export const httpPostBranch = (db: Pool) => [
  json(),
  validate({ body: bodySchema }),
  asyncHandler(async (req, res) => {
    const branch = req.body.name;
    await branchCreate(db, branch, getUserToken(req));
    res.send({});
  })
];
