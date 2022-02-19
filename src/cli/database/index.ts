// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./sql.d.ts" />
import type { Pool, QueryResult } from "pg";
import schema from "./schema.sql";
import type { DB_VERSION } from "./types";

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

