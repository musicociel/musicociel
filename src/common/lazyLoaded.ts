export class MissingHandler extends Error {
  constructor(public type: string) {
    super(`Missing handler for ${type}`);
  }
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const lazyLoaded = <T extends string, P extends any[], R>(
  map: Partial<Record<T, () => Promise<{ default: (...args: P) => R | Promise<R> }>>>
) => {
  const cache: Partial<Record<T, (...args: P) => R | Promise<R>>> = Object.create(null);
  const res = async (type: T, ...args: P): Promise<R> => {
    let handler = cache[type];
    if (!handler && hasOwnProperty.call(map, type)) {
      const loadFn = map[type]!;
      // TODO: prevent possible parallel call of loadFn
      handler = (await loadFn()).default;
      cache[type] = handler;
    }
    if (!handler) {
      throw new MissingHandler(type);
    }
    return await handler(...args);
  };
  res.has = (type: T) => hasOwnProperty.call(map, type);
  res.items = Object.keys(map);
  return res;
};
