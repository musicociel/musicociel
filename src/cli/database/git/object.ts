import type { PoolClient } from "pg";
import { createHash } from "crypto";
import { DB_GIT_OBJECT, DB_GIT_OBJECT_TYPE } from "../types";

export const bufferToChecksum = (buffer: Buffer, type = DB_GIT_OBJECT_TYPE.blob, hashAlgorithm = "sha1") => {
  const hashObject = createHash(hashAlgorithm);
  hashObject.update(`${type} ${buffer.length}\u0000`);
  hashObject.update(buffer);
  return hashObject.digest();
};

export const createObject = (buffer: Buffer, type = DB_GIT_OBJECT_TYPE.blob, hashAlgorithm = "sha1"): DB_GIT_OBJECT => {
  const hash = bufferToChecksum(buffer, type, hashAlgorithm);
  return { hash, type, content: buffer };
};

export const insertObject = async (db: PoolClient, object: DB_GIT_OBJECT) => {
  await db.query(`INSERT INTO "GIT_OBJECT" ("hash", "type", "content") VALUES ($1, $2, $3) ON CONFLICT ("hash") DO NOTHING;`, [
    object.hash,
    object.type,
    object.content
  ]);
};
