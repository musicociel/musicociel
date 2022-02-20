import type { Pool } from "pg";
import { asyncHandler } from "../middleware/asyncHandler";
import { Forbidden } from "http-errors";
import { getUserConditions, getUserToken } from "./utils/auth";
import { Permissions } from "../../common/storage/permissions";
import { getLibraryInfo } from "./httpGetLibrary";

export const deleteLibrary = async (dbPool: Pool, userConditions: string[], library: string) => {
  const db = await dbPool.connect();
  try {
    await db.query(`BEGIN`);
    const libraryInfo = await getLibraryInfo(db, userConditions, library);
    if (!(libraryInfo.permissions & Permissions.WritePermissions)) {
      throw new Forbidden();
    }
    await db.query(`DELETE FROM "GIT_LIBRARY_PERMISSIONS" b WHERE b.library = $1`, [library]);
    await db.query(`DELETE FROM "GIT_LIBRARY" b WHERE b.library = $1`, [library]);
    await db.query("COMMIT");
    return {};
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    db.release();
  }
};

export const httpDeleteLibrary = (db: Pool) => [
  asyncHandler(async (req, res) => {
    const { library } = req.params;
    await deleteLibrary(db, getUserConditions(getUserToken(req)), library);
    res.send({});
  })
];
