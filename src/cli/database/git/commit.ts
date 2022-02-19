import type { PoolClient } from "pg";
import { createObject, insertObject } from "./object";
import { DB_GIT_COMMIT, DB_GIT_OBJECT, DB_GIT_OBJECT_TYPE } from "../types";

// TODO: validate that input data produces a valid commit (avoid invalid characters in input or escape as needed)
const personInfo = (name: string, email: string, timestamp: Date) => `${name} <${email}> ${Math.round(timestamp.getTime() / 1000)} +0000`;

export const createCommit = (commitInfo: Omit<DB_GIT_COMMIT, "hash">): { object: DB_GIT_OBJECT; commit: DB_GIT_COMMIT } => {
  const content = [
    `tree ${commitInfo.tree.toString("hex")}\n`,
    ...commitInfo.parents.map((parent) => `parent ${parent.toString("hex")}\n`),
    `author ${personInfo(commitInfo.author_name, commitInfo.author_email, commitInfo.author_timestamp)}\n`,
    `committer ${personInfo(commitInfo.committer_name, commitInfo.committer_email, commitInfo.committer_timestamp)}\n`,
    `\n\n`,
    commitInfo.message
  ];
  const buffer = Buffer.from(content.join(""));
  const object = createObject(buffer, DB_GIT_OBJECT_TYPE.commit);
  return {
    object,
    commit: { ...commitInfo, hash: object.hash }
  };
};

export const insertCommit = async (db: PoolClient, { object, commit }: { object: DB_GIT_OBJECT; commit: DB_GIT_COMMIT }) => {
  await insertObject(db, object);
  await db.query(
    `INSERT INTO "GIT_COMMIT" ("hash", "tree", "parents", "author_name", "author_email", "author_timestamp", "committer_name", "committer_email", "committer_timestamp", "message") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT ("hash") DO NOTHING`,
    [
      commit.hash,
      commit.tree,
      commit.parents,
      commit.author_name,
      commit.author_email,
      commit.author_timestamp,
      commit.committer_name,
      commit.committer_email,
      commit.committer_timestamp,
      commit.message
    ]
  );
  await db.query(
    `WITH RECURSIVE commit_trees("tree", "path") AS (
        VALUES ($2::bytea, ''::varchar)
        UNION ALL
        SELECT e."content_hash", (t."path" || '/' || e."name") FROM "GIT_TREE_ENTRY" e INNER JOIN commit_trees t ON e."tree" = t."tree" WHERE e."mode" = 'tree'
      )
      INSERT INTO "GIT_COMMIT_TREE" ("commit", "tree", "path") SELECT $1, "tree", "path" FROM commit_trees ON CONFLICT DO NOTHING`,
    [commit.hash, commit.tree]
  );
};
