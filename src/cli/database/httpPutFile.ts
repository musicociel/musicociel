import type { Pool } from "pg";
import { Permissions } from "../../common/storage/permissions";
import { asyncHandler } from "../middleware/asyncHandler";
import { raw as rawBodyParser } from "body-parser";
import { createCommit, insertCommit } from "./git/commit";
import { createObject, insertObject } from "./git/object";
import { buildExistingTree, createTree, getTreeAt, insertTree } from "./git/tree";
import { DB_GIT_TREE_ENTRY_MODE } from "./types";
import { Forbidden, PreconditionFailed, Conflict } from "http-errors";
import { getUserConditions, getUserToken } from "./utils/auth";
import { splitPath } from "./utils/splitPath";
import { getBranchInfo } from "./httpGetBranch";
import { parseEtag } from "./utils/etag";

const newFilePreconditionBuffer = parseEtag(`"null"`)!;

export const putFile = async (
  dbPool: Pool,
  userTokenContent: any,
  userIp: string,
  branch: string,
  filePath: string,
  content: Buffer /*| null*/,
  commitMessage: string,
  previousContentHash?: Buffer
) => {
  const [fileDirectory, fileName] = splitPath(filePath);
  const { preferred_username: userName, email: userEmail } = userTokenContent ?? {};
  const commitName = userName ?? "";
  const commitEmail = userEmail ?? "";
  const date = new Date();
  const userConditions = getUserConditions(userTokenContent);
  const db = await dbPool.connect();
  try {
    await db.query(`BEGIN`);
    const branchInfo = await getBranchInfo(db, userConditions, branch);
    const noReadPermission = !(branchInfo.permissions & Permissions.ReadContent);
    if (!(branchInfo.permissions & Permissions.WriteContent) || (previousContentHash && noReadPermission)) {
      throw new Forbidden();
    }
    const treeToBuild = await buildExistingTree(db, branchInfo.commit, [fileDirectory]);
    const parentTree = getTreeAt(treeToBuild, fileDirectory);
    const existingFileNameEntry = parentTree[fileName];
    if (
      previousContentHash &&
      !(
        existingFileNameEntry &&
        existingFileNameEntry.mode === DB_GIT_TREE_ENTRY_MODE.file_normal &&
        existingFileNameEntry.content_hash.equals(previousContentHash)
      ) &&
      !(existingFileNameEntry == null && newFilePreconditionBuffer.equals(previousContentHash))
    ) {
      throw new PreconditionFailed();
    }
    const fileObject = createObject(content);
    if (
      existingFileNameEntry &&
      existingFileNameEntry.mode === DB_GIT_TREE_ENTRY_MODE.file_normal &&
      fileObject.hash.equals(existingFileNameEntry.content_hash)
    ) {
      // no change!
      await db.query("ROLLBACK");
      return {
        noReadPermission,
        oldFileHash: existingFileNameEntry.content_hash,
        newFileHash: fileObject.hash,
        oldCommit: branchInfo.commit,
        newCommit: branchInfo.commit!
      };
    }
    parentTree[fileName] = {
      content_hash: fileObject.hash,
      mode: DB_GIT_TREE_ENTRY_MODE.file_normal
    };
    const tree = createTree(treeToBuild);
    const commit = createCommit({
      tree: tree.hash,
      author_name: commitName,
      author_email: commitEmail,
      author_timestamp: date,
      committer_name: commitName,
      committer_email: commitEmail,
      committer_timestamp: date,
      parents: branchInfo.commit ? [branchInfo.commit] : [],
      message: commitMessage
    });
    await insertObject(db, fileObject);
    await insertTree(db, tree);
    await insertCommit(db, commit);
    const res = await db.query(`UPDATE "GIT_BRANCH" SET "commit" = $1 WHERE "branch" = $2 AND "commit" IS NOT DISTINCT FROM $3`, [
      commit.commit.hash,
      branch,
      branchInfo.commit
    ]);
    if (res.rowCount != 1) {
      throw new Conflict();
    }
    await db.query(
      `INSERT INTO "GIT_BRANCH_CHANGES" ("branch", "timestamp", "user_id", "user_ip", "user_name", "user_email", "commit_before", "commit_after", "non_fast_forward") VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, false
      )`,
      [branch, date, userTokenContent?.sub, userIp, userName, userEmail, branchInfo.commit, commit.commit.hash]
    );
    await db.query("COMMIT");
    return {
      noReadPermission,
      oldFileHash:
        existingFileNameEntry && existingFileNameEntry.mode === DB_GIT_TREE_ENTRY_MODE.file_normal ? existingFileNameEntry?.content_hash : null,
      newFileHash: fileObject.hash,
      oldCommit: branchInfo.commit,
      newCommit: commit.commit.hash
    };
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    db.release();
  }
};

export const httpPutFile = (db: Pool) => [
  rawBodyParser({ type: "*/*" }),
  asyncHandler(async (req, res) => {
    const { branch, path } = req.params;
    const previousContentHash = parseEtag(req.headers["if-match"]);
    // TODO: allow customization of the commit message from a header
    const commitMessage = "Update";
    const result = await putFile(db, getUserToken(req), req.ip, branch, path, req.body, commitMessage, previousContentHash);
    res.send(
      result.noReadPermission
        ? {
            newFileHash: result.newFileHash.toString("base64")
          }
        : {
            oldFileHash: result.oldFileHash?.toString("base64") ?? null,
            newFileHash: result.newFileHash.toString("base64"),
            oldCommit: result.oldCommit?.toString("base64") ?? null,
            newCommit: result.newCommit.toString("base64")
          }
    );
  })
];
