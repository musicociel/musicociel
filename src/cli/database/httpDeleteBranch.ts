import type { Pool } from "pg";
import { asyncHandler } from "../middleware/asyncHandler";
import { Forbidden } from "http-errors";
import { getUserConditions, getUserToken } from "./utils/auth";
import { Permissions } from "../../common/storage/permissions";
import { getBranchInfo } from "./httpGetBranch";

export const deleteBranch = async (dbPool: Pool, userConditions: string[], branch: string) => {
  const db = await dbPool.connect();
  try {
    await db.query(`BEGIN`);
    const branchInfo = await getBranchInfo(db, userConditions, branch);
    if (!(branchInfo.permissions & Permissions.WritePermissions)) {
      throw new Forbidden();
    }
    await db.query(`DELETE FROM "GIT_BRANCH_PERMISSIONS" b WHERE b.branch = $1`, [branch]);
    await db.query(`DELETE FROM "GIT_BRANCH" b WHERE b.branch = $1`, [branch]);
    await db.query("COMMIT");
    return {};
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    db.release();
  }
};

export const httpDeleteBranch = (db: Pool) => [
  asyncHandler(async (req, res) => {
    const { branch } = req.params;
    await deleteBranch(db, getUserConditions(getUserToken(req)), branch);
    res.send({});
  })
];
