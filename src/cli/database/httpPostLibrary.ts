import type { Pool } from "pg";
import { Permissions, permissionToBitString } from "../../common/storage/permissions";
import { validate, Schema } from "../middleware/errorHandler";
import { asyncHandler } from "../middleware/asyncHandler";
import type { DB_GIT_LIBRARY, DB_GIT_LIBRARY_PERMISSIONS } from "./types";
import { json } from "body-parser";
import { getUserToken } from "./utils/auth";

export const libraryCreate = async (
  dbPool: Pool,
  library: string,
  userTokenContent: any
): Promise<Pick<DB_GIT_LIBRARY & DB_GIT_LIBRARY_PERMISSIONS, "library" | "commit" | "permissions">> => {
  const db = await dbPool.connect();
  try {
    const permissions = Permissions.Admin;
    await db.query(`BEGIN`);
    await db.query(`INSERT INTO "GIT_LIBRARY" ("library", "commit") VALUES ($1, NULL)`, [library]);
    await db.query(`INSERT INTO "GIT_LIBRARY_PERMISSIONS" ("library", "userCondition", "permissions") VALUES ($1, $2, $3)`, [
      library,
      `user-uuid:${userTokenContent.sub}`,
      permissionToBitString(permissions)
    ]);
    await db.query("COMMIT");
    return {
      library,
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
    library: { type: "string", pattern: "^[\\w-]+$" }
  }
};

export const httpPostLibrary = (db: Pool) => [
  json(),
  validate({ body: bodySchema }),
  asyncHandler(async (req, res) => {
    const { library } = req.body;
    await libraryCreate(db, library, getUserToken(req));
    res.send({});
  })
];
