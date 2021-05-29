import { pathToRegexp, Key } from "path-to-regexp";

const pathCache: { [k: string]: { regExp: RegExp; keys: Key[] } } = {};

export function compilePath(path: string, prefix = false) {
  const cacheKey = `${path}-${prefix}`;
  let result = pathCache[cacheKey];
  if (!result) {
    const keys: Key[] = [];
    const regExp = pathToRegexp(path, keys, {
      end: !prefix,
      sensitive: true,
      strict: true
    });
    result = { regExp, keys };
    pathCache[cacheKey] = result;
  }
  return result;
}

export interface Match {
  path: string;
  url: string;
  params: { [key: string]: string };
}

export function matchPath(pathname: string, paths: string | string[], prefix = false): null | Match {
  if (!Array.isArray(paths)) {
    paths = [paths];
  }
  for (const path of paths) {
    const { regExp, keys } = compilePath(path, prefix);
    const match = regExp.exec(pathname);
    if (match) {
      const params = {};
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        params[key.name] = match[i + 1];
      }
      return {
        path,
        url: match[0],
        params
      };
    }
  }
  return null;
}
