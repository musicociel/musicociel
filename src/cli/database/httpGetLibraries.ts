import type { Pool } from "pg";
import { asyncHandler } from "../middleware/asyncHandler";
import { protectLibraryPermission } from "./httpGetLibrary";
import type { DB_GIT_LIBRARY, DB_GIT_LIBRARY_PERMISSIONS } from "./types";
import { getUserConditions, getUserToken } from "./utils/auth";

export const librariesList = async (db: Pool, userConditions: string[]) => {
  const libraries = (
    await db.query<DB_GIT_LIBRARY & Pick<DB_GIT_LIBRARY_PERMISSIONS, "permissions">>(
      `SELECT b."library", b."commit", p."permissions"
       FROM "GIT_LIBRARY" b
       INNER JOIN  (
         SELECT "library", bit_or("permissions")::integer as "permissions"
         FROM "GIT_LIBRARY_PERMISSIONS"
         WHERE "userCondition" = ANY ($1)
         GROUP BY "library"
       ) AS p ON p."library" = b."library"
       ORDER BY b."library"`,
      [userConditions]
    )
  ).rows;
  return libraries;
};

export const httpGetLibraries = (db: Pool) => [
  asyncHandler(async (req, res) => {
    const libraries = await librariesList(db, getUserConditions(getUserToken(req)));
    for (const library of libraries) {
      protectLibraryPermission(library);
    }
    res.send(libraries);
  })
];
