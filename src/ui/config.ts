import type { Config } from "../common/config";

export const address = new URL("./", document.baseURI || window.location.href).toString().replace(/[/]*$/, "");

export const configPromise: Promise<Config> = (async () => {
  const response = await fetch("musicociel.json");
  return await response.json();
})();
