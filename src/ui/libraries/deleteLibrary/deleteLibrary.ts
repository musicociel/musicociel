import { authFetch } from "../../auth";
import type { Library } from "../libraries";
import { libraries } from "../libraries";

export const deleteLibrary = async (library: Library) => {
  await authFetch(`libraries/${encodeURIComponent(library.library)}`, {
    method: "DELETE"
  });
  libraries.refresh();
};
