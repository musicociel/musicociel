import type { ReadableSignal, WritableSignal } from "@amadeus-it-group/tansu";
import { computed, asReadable, get } from "@amadeus-it-group/tansu";

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

export const allBooleansStore = (stores: ReadableSignal<WritableSignal<boolean>[]>): WritableSignal<boolean | null> => {
  return asReadable(
    computed(() => allBooleans(stores().map(get))),
    {
      set(value: boolean | null) {
        if (value === true || value === false) {
          const array = stores();
          for (const item of array) {
            item.set(value);
          }
        }
      },
      update: notImplemented
    } as Pick<WritableSignal<boolean | null>, "set" | "update">
  );
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

export const countTrueStore = (stores: ReadableSignal<WritableSignal<boolean>[]>) => computed(() => countTrue(stores().map(get)));
