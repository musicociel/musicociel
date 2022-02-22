import { writable } from "svelte/store";
import { configPromise } from "../config";

export const hasLibraries = writable(false);
configPromise.then((config) => {
  hasLibraries.set(!config.noDb);
});
