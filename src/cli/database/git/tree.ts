import type { PoolClient } from "pg";
import type { DB_GIT_COMMIT_TREE, DB_GIT_OBJECT, DB_GIT_TREE_ENTRY, DB_HASH } from "../types";
import { DB_GIT_OBJECT_TYPE, DB_GIT_TREE_ENTRY_MODE } from "../types";
import { createObject, insertObject } from "./object";

export type TreeEntryExistingRef = Omit<DB_GIT_TREE_ENTRY, "tree" | "name">;
export interface TreeEntryNewRef {
  mode: DB_GIT_TREE_ENTRY_MODE.tree;
  content: TreeToBuild;
}
export type TreeEntry = TreeEntryExistingRef | TreeEntryNewRef;
export type TreeToBuild = Record<string, TreeEntry>;

export type BuiltTrees = { objects: DB_GIT_OBJECT[]; entries: DB_GIT_TREE_ENTRY[] };

const gitModes: Record<DB_GIT_TREE_ENTRY_MODE, string> = {
  [DB_GIT_TREE_ENTRY_MODE.file_executable]: "100755",
  [DB_GIT_TREE_ENTRY_MODE.file_normal]: "100644",
  [DB_GIT_TREE_ENTRY_MODE.link]: "120000",
  [DB_GIT_TREE_ENTRY_MODE.tree]: "040000"
};

export const entriesComparator = (
  { name: aName, mode: aMode }: Pick<DB_GIT_TREE_ENTRY, "name" | "mode">,
  { name: bName, mode: bMode }: Pick<DB_GIT_TREE_ENTRY, "name" | "mode">
) => {
  if (aMode === DB_GIT_TREE_ENTRY_MODE.tree) {
    aName += "/";
  }
  if (bMode === DB_GIT_TREE_ENTRY_MODE.tree) {
    bName += "/";
  }
  return aName < bName ? -1 : aName > bName ? 1 : 0;
};

const toEntries = (treeToBuild: TreeToBuild, builtTrees: BuiltTrees): Omit<DB_GIT_TREE_ENTRY, "tree">[] => {
  const entries: Omit<DB_GIT_TREE_ENTRY, "tree">[] = [];
  for (const name of Object.keys(treeToBuild)) {
    const entry = treeToBuild[name];
    if ("content" in entry) {
      const { hash: content_hash } = createTree(entry.content, builtTrees);
      entries.push({ name, mode: entry.mode, content_hash });
    } else {
      entries.push({ ...entry, name });
    }
  }
  entries.sort(entriesComparator);
  return entries;
};

export const createTree = (treeToBuild: TreeToBuild, res: BuiltTrees = { objects: [], entries: [] }): BuiltTrees & { hash: DB_HASH } => {
  const parts: Buffer[] = [];
  const currentEntries = toEntries(treeToBuild, res);
  for (const entry of currentEntries) {
    parts.push(Buffer.from(`${gitModes[entry.mode]} ${entry.name}\u0000`, "utf8"), entry.content_hash);
    res.entries.push(entry as any);
  }
  const buffer = Buffer.concat(parts);
  const object = createObject(buffer, DB_GIT_OBJECT_TYPE.tree);
  res.objects.push(object);
  for (const entry of currentEntries) {
    (entry as any).tree = object.hash;
  }
  return {
    ...res,
    hash: object.hash
  };
};

export const insertTree = async (db: PoolClient, { objects, entries }: BuiltTrees) => {
  for (const object of objects) {
    await insertObject(db, object);
  }
  for (const entry of entries) {
    await db.query(
      `INSERT INTO "GIT_TREE_ENTRY" ("tree", "name", "mode", "content_hash") VALUES ($1, $2, $3, $4) ON CONFLICT ("tree", "name") DO NOTHING`,
      [entry.tree, entry.name, entry.mode, entry.content_hash]
    );
  }
};

export const getTreeAt = (tree: TreeToBuild, path: string, checkDir = true) => {
  if (path !== "") {
    if (path.charAt(0) !== "/") {
      throw new Error("Path should start with slash");
    }
    const pathParts = path.substring(1).split("/");
    for (const item of pathParts) {
      let next = tree[item];
      if (!next || (!checkDir && !("content" in next) && next.mode === DB_GIT_TREE_ENTRY_MODE.tree)) {
        next = {
          mode: DB_GIT_TREE_ENTRY_MODE.tree,
          content: {}
        };
        tree[item] = next;
      } else if (!("content" in next)) {
        throw new Error("Invalid path in tree");
      }
      tree = next.content;
    }
  }
  return tree;
};

const sortAndRemoveDuplicates = <T>(items: T[]) => {
  items.sort();
  let last = items[0];
  for (let i = 1; i < items.length; i++) {
    if (items[i] === last) {
      items.splice(i, 1);
      i--;
    } else {
      last = items[i];
    }
  }
};

const completePaths = (paths: string[]) => {
  const output: string[] = [];
  for (const path of paths) {
    const parts = path.split("/");
    while (parts.length > 0) {
      output.push(parts.join("/"));
      parts.pop();
    }
  }
  sortAndRemoveDuplicates(output);
  return output;
};

export const buildExistingTree = async (db: PoolClient, commit: DB_HASH | null, paths: string[]): Promise<TreeToBuild> => {
  const output = Object.create(null);
  if (commit) {
    paths = completePaths(paths);
    const { rows: treeEntries } = await db.query<Pick<DB_GIT_TREE_ENTRY & DB_GIT_COMMIT_TREE, "path" | "name" | "content_hash" | "mode">>(
      `SELECT t."path", e."name", e."content_hash", e."mode"
            FROM "GIT_COMMIT_TREE" t
      INNER JOIN "GIT_TREE_ENTRY" e ON e."tree" = t."tree"
      WHERE t."commit" = $1
        AND t."path" = ANY ($2)
      ORDER BY t."path"`,
      [commit, paths]
    );
    for (const { path, name, mode, content_hash } of treeEntries) {
      const subTree = getTreeAt(output, path, false);
      const existingItem = subTree[name];
      if (existingItem) {
        throw new Error("duplicate item");
      }
      subTree[name] = { mode, content_hash };
    }
  }
  return output;
};
