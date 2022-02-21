import { authFetch } from "../../auth";
import { libraries, Library } from "../libraries";

export const deleteLibrary = async (library: Library) => {
  await authFetch(`libraries/${encodeURIComponent(library.library)}`, {
    method: "DELETE"
  });
  libraries.refresh();
};
