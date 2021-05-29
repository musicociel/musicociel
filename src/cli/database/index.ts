// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./sql.d.ts" />
import type { Pool, QueryResult } from "pg";
import schema from "./schema.sql";
import { v4 as createUUID } from "uuid";
import type { DB_GIT_BRANCH, DB_GIT_BRANCH_PERMISSIONS, DB_VERSION } from "./types";

const expectedVersion = "musicociel-v0";

export const checkDB = async (db: Pool) => {
  try {
    console.log(`Accessing database...`);
    await db.query(schema);
    console.log(`The database was initialized with schema version ${expectedVersion}.`);
  } catch (error1) {
    let response: QueryResult<DB_VERSION>;
    try {
      response = await db.query(`SELECT "musicociel_version" FROM "VERSION"`);
    } catch (error2) {
      throw new Error(
        `The database is not correctly initialized and it failed to be initialized.\nThere may be connection or access right issues or it may already contain data in a format that is incompatible with this version of Musicociel.\n${error1}\n${error2}`
      );
    }
    const existingVersion = response.rowCount === 1 ? response.rows[0].musicociel_version : "unknown";
    if (existingVersion !== expectedVersion) {
      throw new Error(
        `The database contains data from an incompatible version of Musicociel: ${existingVersion} (expected version ${expectedVersion})`
      );
    }
    console.log("The database is already initialized.");
  }
};

export const getUserConditions = (userTokenContent: any) => {
  const res = ["public"];
  if (userTokenContent) {
    userTokenContent.sub && res.push(`user-uuid:${userTokenContent.sub}`);
    userTokenContent.preferred_username && res.push(`user-name:${userTokenContent.preferred_username}`);
    userTokenContent.email && res.push(`user-email:${userTokenContent.email}`);
    const groups = userTokenContent.groups;
    if (Array.isArray(groups)) {
      groups.forEach((group) => res.push(`group:${group}`));
    }
  }
  return res;
};

export const branchCreate = async (
  dbPool: Pool,
  name: string,
  userTokenContent: any
): Promise<DB_GIT_BRANCH & Partial<DB_GIT_BRANCH_PERMISSIONS>> => {
  const uuid = createUUID();
  const db = await dbPool.connect();
  try {
    await db.query(`BEGIN`);
    await db.query(`INSERT INTO "GIT_BRANCH" ("branch", "name", "commit") VALUES ($1, $2, NULL)`, [uuid, name]);
    await db.query(
      `INSERT INTO "GIT_BRANCH_PERMISSIONS" ("branch", "userCondition", "read_content", "write_content", "read_history", "write_history", "read_permissions", "write_permissions") VALUES ($1, $2, 'true', 'true', 'true', 'true', 'true', 'true')`,
      [uuid, `user-uuid:${userTokenContent.sub}`]
    );
    await db.query("COMMIT");
    return {
      branch: uuid,
      name,
      commit: null,
      read_content: true,
      write_content: true,
      read_history: true,
      write_history: true,
      read_permissions: true,
      write_permissions: true
    };
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    db.release();
  }
};

export const branchesList = async (db: Pool, userTokenContent: any) => {
  const userConditions = getUserConditions(userTokenContent);
  const rows = (
    await db.query<DB_GIT_BRANCH & Partial<DB_GIT_BRANCH_PERMISSIONS>>(
      `SELECT l."branch", l."name", CASE bool_or(r."read_content") WHEN true THEN l."commit" ELSE NULL END as "commit", bool_or(r."read_content") as "read_content", bool_or(r."write_content") as "write_content", bool_or(r."read_history") as "read_history", bool_or(r."write_history") as "write_history", bool_or(r."read_permissions") as "read_permissions", bool_or(r."write_permissions") as "write_permissions" FROM "GIT_BRANCH" l INNER JOIN "GIT_BRANCH_PERMISSIONS" r ON l."branch" = r."branch" WHERE r."userCondition" = ANY ($1) GROUP BY l."branch"`,
      [userConditions]
    )
  ).rows;
  return rows;
};

export const branchInfo = async (db: Pool, branch: string, userTokenContent: any) => {
  const userConditions = getUserConditions(userTokenContent);
  const rows = (
    await db.query<DB_GIT_BRANCH & Partial<DB_GIT_BRANCH_PERMISSIONS>>(
      `SELECT l."branch", l."name", CASE bool_or(r."read_content") WHEN true THEN l."commit" ELSE NULL END as "commit", bool_or(r."read_content") as "read_content", bool_or(r."write_content") as "write_content", bool_or(r."read_history") as "read_history", bool_or(r."write_history") as "write_history", bool_or(r."read_permissions") as "read_permissions", bool_or(r."write_permissions") as "write_permissions" FROM "GIT_BRANCH" l INNER JOIN "GIT_BRANCH_PERMISSIONS" r ON l."branch" = r."branch" WHERE r."userCondition" = ANY ($1) AND l."branch" = $2 GROUP BY l."branch"`,
      [userConditions, branch]
    )
  ).rows;
  return rows[0];
};
