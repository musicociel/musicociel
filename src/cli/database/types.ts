// Note: keep in sync with schema.sql

import type { Permissions } from "../../common/storage/permissions";

export type DB_HASH = Buffer;

export enum DB_GIT_OBJECT_TYPE {
  commit = "commit",
  tree = "tree",
  blob = "blob"
}

export interface DB_GIT_OBJECT {
  hash: DB_HASH;
  type: DB_GIT_OBJECT_TYPE;
  content: Buffer;
}

export enum DB_GIT_TREE_ENTRY_MODE {
  tree = "tree",
  link = "link",
  file_normal = "file_normal",
  file_executable = "file_executable"
}

export interface DB_GIT_TREE_ENTRY {
  tree: DB_HASH;
  name: string;
  mode: DB_GIT_TREE_ENTRY_MODE;
  content_hash: DB_HASH;
}

export interface DB_GIT_COMMIT {
  hash: DB_HASH;
  tree: DB_HASH;
  parents: DB_HASH[];
  author_name: string;
  author_email: string;
  author_timestamp: Date;
  committer_name: string;
  committer_email: string;
  committer_timestamp: Date;
  message: string;
}

export interface DB_GIT_COMMIT_TREE {
  commit: DB_HASH;
  tree: DB_HASH;
  path: string;
}

export interface DB_GIT_LIBRARY {
  library: string;
  commit: DB_HASH | null;
}

export interface DB_GIT_LIBRARY_CHANGES {
  library: string;
  timestamp: Date;
  user_id: string;
  user_ip: string;
  user_name: string;
  user_email: string;
  commit_before: DB_HASH;
  commit_after: DB_HASH;
  non_fast_forward: boolean;
}

export interface DB_GIT_LIBRARY_PERMISSIONS {
  library: string;
  userCondition: string;
  permissions: Permissions;
}

export interface DB_VERSION {
  musicociel_version: string;
}
