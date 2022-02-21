import { authFetch } from "../../auth";
import { libraries } from "../libraries";

export const createLibrary = async (library: string) => {
  await authFetch("libraries", {
    method: "POST",
    body: JSON.stringify({ library }),
    headers: { "content-type": "application/json" }
  });
  libraries.refresh();
};
