import { produce } from "immer";
import type { ReadableSignal, StoresInput, StoresInputValues, WritableSignal } from "@amadeus-it-group/tansu";
import { derived, writable, asReadable } from "@amadeus-it-group/tansu";

export interface PromiseValue<T> {
  loading: boolean;
  hasError: boolean;
  value: T;
  error: any;
}

export interface RefreshablePromiseValue<T> extends ReadableSignal<PromiseValue<T>> {
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

export const asyncDerived = <S extends StoresInput, T>(
  stores: S,
  factory: (storeValues: StoresInputValues<S>, abortSignal: AbortSignal) => Promise<T>,
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
  const storesArray = isStoresArray
    ? ([refreshStore, ...stores] as [WritableSignal<object>, ...typeof stores])
    : ([refreshStore, stores] as [WritableSignal<object>, S]);
  const refresh = () => refreshStore.set({});
  return asReadable(
    derived(
      storesArray,
      ([_, ...values], set) => {
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
      },
      lastValue
    ),
    {
      refresh
    } as Pick<RefreshablePromiseValue<T>, "refresh">
  );
};
