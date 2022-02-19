import type { Pool, PoolClient } from "pg";
import { Permissions } from "../../common/storage/permissions";
import { asyncHandler } from "../middleware/asyncHandler";
import { NotFound } from "http-errors";
import type { DB_GIT_BRANCH_PERMISSIONS, DB_GIT_COMMIT_TREE, DB_GIT_OBJECT, DB_GIT_TREE_ENTRY } from "./types";
import { getUserConditions, getUserToken } from "./utils/auth";
import { splitPath } from "./utils/splitPath";
import { formatEtag } from "./utils/etag";

export const getFileInfo = async (db: Pool | PoolClient, userConditions: string[], branch: string, filePath: string) => {
  const [fileDirectory, fileName] = splitPath(filePath);
  const [info] = (
    await db.query<Pick<DB_GIT_TREE_ENTRY & DB_GIT_COMMIT_TREE & DB_GIT_BRANCH_PERMISSIONS, "content_hash" | "mode" | "commit" | "permissions">>(
      `SELECT e."content_hash", e."mode", t."commit", p."permissions"
              FROM "GIT_TREE_ENTRY"         e
        INNER JOIN "GIT_COMMIT_TREE"        t ON t."tree" = e."tree"
        INNER JOIN "GIT_BRANCH"             b ON b."commit" = t."commit"
        INNER JOIN (
          SELECT "branch", bit_or("permissions")::integer as "permissions"
            FROM "GIT_BRANCH_PERMISSIONS"
           WHERE "userCondition" = ANY ($1)
             AND "branch" = $2
           GROUP BY "branch"
        )                                AS p ON p."branch" = b."branch"
        WHERE e."name" = $3
          AND t."path" = $4
          AND p."permissions" & $5 <> 0`,
      [userConditions, branch, fileName, fileDirectory, Permissions.ReadContent]
    )
  ).rows;
  if (!info) {
    throw new NotFound();
  }
  return info;
};

export const getFileContent = async (db: Pool | PoolClient, contentHash: Buffer) => {
  const { rows } = await db.query<Pick<DB_GIT_OBJECT, "content">>(`SELECT "content" FROM "GIT_OBJECT" WHERE "hash" = $1`, [contentHash]);
  return rows[0].content;
};

export const httpGetFile = (db: Pool) => [
  asyncHandler(async (req, res) => {
    const { branch, path } = req.params;
    const fileInfo = await getFileInfo(db, getUserConditions(getUserToken(req)), branch, path);
    res.header("Commit", fileInfo.commit.toString("base64"));
    res.header("ETag", formatEtag(fileInfo.content_hash));
    if (req.stale) {
      const content = await getFileContent(db, fileInfo.content_hash);
      res.send(content);
    } else {
      res.status(304).send();
    }
  })
];
