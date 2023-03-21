import { writable } from "@amadeus-it-group/tansu";
import { configPromise } from "../config";

export const hasLibraries = writable(false);
configPromise.then((config) => {
  hasLibraries.set(!config.noDb);
});
