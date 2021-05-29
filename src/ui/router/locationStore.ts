import { readable } from "svelte/store";
import type { History, Path, Location } from "history";

export type To = Path | Location;

export interface LocationInfo {
  pathname: string;
  search: URLSearchParams;
  hash: URLSearchParams;
}

export const createLocationStore = (history: History) => {
  const navigate = (location: To, replace = false) => (replace ? history.replace(location) : history.push(location));
  const createHref = (location: To) => (typeof location === "string" ? location : history.createHref(location));
  const mapLocation = ({ pathname, search, hash }: Location): LocationInfo => {
    return {
      pathname,
      search: new URLSearchParams(search),
      hash: new URLSearchParams(hash)
    };
  };
  const { subscribe } = readable(mapLocation(history.location), (set) => history.listen((location) => set(mapLocation(location))));
  return {
    subscribe,
    navigate,
    createHref
  };
};
