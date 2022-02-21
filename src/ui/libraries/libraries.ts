import { Permissions } from "../../common/storage/permissions";
import { authFetch, userId } from "../auth";
import { configPromise } from "../config";
import { asyncDerived } from "../promiseStore";

export type Library = { permissions: Permissions; library: string; commit: string | null };

export const filterLibraries = (libraries: Library[], permissions: Permissions) =>
  permissions === Permissions.None ? libraries : libraries.filter((library) => !!(library.permissions & permissions));

export const libraries = asyncDerived(
  userId, // depend on userId because if the user logs out, the list may change
  async (userId, signal) => {
    const config = await configPromise;
    if (config.noDb) return [];
    const res = await authFetch("libraries", { signal });
    const json: Library[] = await res.json();
    return json;
  },
  [] as Library[]
);
