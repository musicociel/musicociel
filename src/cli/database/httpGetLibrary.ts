import type { Pool, PoolClient } from "pg";
import { asyncHandler } from "../middleware/asyncHandler";
import type { DB_GIT_LIBRARY, DB_GIT_LIBRARY_PERMISSIONS } from "./types";
import { getUserConditions, getUserToken } from "./utils/auth";
import { NotFound } from "http-errors";
import { Permissions } from "../../common/storage/permissions";

export const protectLibraryPermission = (info: DB_GIT_LIBRARY & Pick<DB_GIT_LIBRARY_PERMISSIONS, "permissions">) => {
  if (!(info.permissions & Permissions.ReadContent)) {
    info.commit = null;
  }
};

export const getLibraryInfo = async (db: Pool | PoolClient, userConditions: string[], library: string) => {
  const [libraryInfo] = (
    await db.query<DB_GIT_LIBRARY & Pick<DB_GIT_LIBRARY_PERMISSIONS, "permissions">>(
      `SELECT b."library", b."commit", p."permissions"
       FROM "GIT_LIBRARY" b
       INNER JOIN (
         SELECT "library", bit_or("permissions")::integer as "permissions"
         FROM "GIT_LIBRARY_PERMISSIONS"
         WHERE "userCondition" = ANY ($1) AND library = $2
         GROUP BY "library"
       ) AS p ON p."library" = b."library"`,
      [userConditions, library]
    )
  ).rows;
  if (!libraryInfo) {
    throw new NotFound();
  }
  return libraryInfo;
};

export const httpGetLibrary = (db: Pool) => [
  asyncHandler(async (req, res) => {
    const { library } = req.params;
    const libraryInfo = await getLibraryInfo(db, getUserConditions(getUserToken(req)), library);
    protectLibraryPermission(libraryInfo);
    res.send(libraryInfo);
  })
];
