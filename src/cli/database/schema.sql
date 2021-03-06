BEGIN;

CREATE TYPE "git_object_type" AS ENUM ('commit', 'tree', 'blob');

CREATE TABLE "GIT_OBJECT" (
    "hash" bytea PRIMARY KEY,
    "type" "git_object_type" NOT NULL,
    "content" bytea NOT NULL
);

CREATE TYPE "git_tree_entry_mode" AS ENUM ('tree', 'link', 'file_normal', 'file_executable');

CREATE TABLE "GIT_TREE_ENTRY" (
    "tree" bytea NOT NULL REFERENCES "GIT_OBJECT"("hash"),
    "name" varchar NOT NULL,
    "mode" "git_tree_entry_mode" NOT NULL,
    "content_hash" bytea NOT NULL REFERENCES "GIT_OBJECT"("hash"),
    PRIMARY KEY ("tree", "name")
);

CREATE TABLE "GIT_COMMIT" (
    "hash" bytea PRIMARY KEY REFERENCES "GIT_OBJECT"("hash"),
    "tree" bytea NOT NULL REFERENCES "GIT_OBJECT"("hash"),
    "parents" bytea[] NOT NULL,
    "author_name" varchar NOT NULL,
    "author_email" varchar NOT NULL,
    "author_timestamp" timestamp with time zone NOT NULL,
    "committer_name" varchar NOT NULL,
    "committer_email" varchar NOT NULL,
    "committer_timestamp" timestamp with time zone NOT NULL,
    "message" varchar NOT NULL
);

CREATE TABLE "GIT_COMMIT_TREE" (
    "commit" bytea NOT NULL REFERENCES "GIT_COMMIT"("hash"),
    "tree" bytea NOT NULL REFERENCES "GIT_OBJECT"("hash"),
    "path" varchar NOT NULL,
    PRIMARY KEY ("commit", "tree", "path")
);

CREATE TABLE "GIT_BRANCH" (
    "branch" uuid PRIMARY KEY,
    "name" varchar UNIQUE NOT NULL,
    "commit" bytea REFERENCES "GIT_COMMIT"("hash")
);

CREATE TABLE "GIT_BRANCH_CHANGES" (
    "branch" uuid REFERENCES "GIT_BRANCH"("branch"),
    "timestamp" timestamp with time zone NOT NULL,
    "branch_name" varchar NOT NULL,
    "user_id" uuid,
    "user_ip" inet,
    "user_name" varchar,
    "user_email" varchar,
    "commit_before" bytea REFERENCES "GIT_COMMIT"("hash"),
    "commit_after" bytea REFERENCES "GIT_COMMIT"("hash"),
    "non_fast_forward" boolean,
    PRIMARY KEY ("branch", "timestamp")
);

CREATE TABLE "GIT_BRANCH_COMMIT" (
    "branch" uuid NOT NULL REFERENCES "GIT_BRANCH"("branch"),
    "commit" bytea REFERENCES "GIT_COMMIT"("hash"),
    PRIMARY KEY ("branch", "commit")
);

CREATE TABLE "GIT_BRANCH_PERMISSIONS" (
    "branch" uuid NOT NULL REFERENCES "GIT_BRANCH" ("branch"),
    "userCondition" varchar NOT NULL,
    "read_content" boolean,
    "write_content" boolean,
    "read_history" boolean,
    "write_history" boolean,
    "read_permissions" boolean,
    "write_permissions" boolean,
    PRIMARY KEY ("branch", "userCondition")
);

CREATE TABLE "VERSION" (
    "musicociel_version" varchar PRIMARY KEY
);
INSERT INTO "VERSION" ("musicociel_version") VALUES ('musicociel-v0');

COMMIT;
