import { derived, get, Readable, Writable } from "svelte/store";

export const switchMap = <T, U>(store: Readable<T>, fn: (input: T) => Readable<U>) =>
  derived(store, (value, set) => fn(value).subscribe(set), undefined as any as U);

export const allBooleans = (items: boolean[]) => {
  if (items.length === 0) {
    return null;
  } else {
    const val = !!items[0];
    for (let i = 1, l = items.length; i < l; i++) {
      if (val !== !!items[i]) {
        return null;
      }
    }
    return val;
  }
};

const notImplemented = () => new Error("Not implemented");

export const allBooleansStore = (stores: Readable<Writable<boolean>[]>): Writable<boolean | null> => {
  const { subscribe } = switchMap(stores, (value) => derived(value, allBooleans));
  return {
    subscribe,
    set(value: boolean | null) {
      if (value === true || value === false) {
        const array = get(stores);
        for (const item of array) {
          item.set(value);
        }
      }
    },
    update: notImplemented
  };
};

const countValueFactory =
  <T>(value: T) =>
  (array: T[]) => {
    let result = 0;
    for (const item of array) {
      if (item === value) {
        result++;
      }
    }
    return result;
  };
export const countTrue = countValueFactory(true);

export const countTrueStore = (stores: Readable<Writable<boolean>[]>) => switchMap(stores, (value) => derived(value, countTrue));
