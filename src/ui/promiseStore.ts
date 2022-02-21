import { produce } from "immer";
import { derived, Readable, writable } from "svelte/store";

type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;

type StoresValues<T> = T extends Readable<infer U>
  ? U
  : {
      [K in keyof T]: T[K] extends Readable<infer U> ? U : never;
    };

export interface PromiseValue<T> {
  loading: boolean;
  hasError: boolean;
  value: T;
  error: any;
}

export interface RefreshablePromiseValue<T> extends Readable<PromiseValue<T>> {
  refresh(): void;
}

const updateStateLoading = produce((state: PromiseValue<any>) => {
  state.loading = true;
});

const updateStateFailure = produce((state: PromiseValue<any>, error: any) => {
  state.loading = false;
  state.hasError = true;
  state.error = error;
});

const updateStateSuccess = produce((state: PromiseValue<any>, value: any) => {
  state.loading = false;
  state.hasError = false;
  state.error = undefined;
  state.value = value;
});

export const asyncDerived = <S extends Stores, T>(
  stores: S,
  factory: (storeValues: StoresValues<S>, abortSignal: AbortSignal) => Promise<T>,
  initialValue: T
): RefreshablePromiseValue<T> => {
  let lastValue: PromiseValue<T> = {
    loading: false,
    hasError: false,
    value: initialValue,
    error: undefined
  };
  const refreshStore = writable({});
  const isStoresArray = Array.isArray(stores);
  const storesArray = isStoresArray ? [refreshStore, ...(stores as any)] : ([refreshStore, stores] as any);
  const refresh = () => refreshStore.set({});
  return {
    refresh,
    ...derived<S extends Array<any> ? [any, ...S] : [any, S], PromiseValue<T>>(storesArray, ([_, ...values], set) => {
      const abortController = new AbortController();
      set((lastValue = updateStateLoading(lastValue)));
      (async () => {
        try {
          const result = await factory(isStoresArray ? values : (values[0] as any), abortController.signal);
          if (!abortController.signal.aborted) {
            set((lastValue = updateStateSuccess(lastValue, result)));
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            set((lastValue = updateStateFailure(lastValue, error)));
          }
        }
      })();
      return () => abortController.abort();
    })
  };
};
