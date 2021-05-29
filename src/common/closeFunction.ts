const noop = () => {};

export const onAbort = (signal: AbortSignal | undefined, callback: () => void) => {
  if (signal?.aborted) {
    callback();
    return null;
  } else {
    signal?.addEventListener("abort", callback);
    return signal ? () => signal.removeEventListener("abort", callback) : noop;
  }
};

export interface CloseFunction {
  (): void;
  signal: AbortSignal;
}

export const closeFactory = (inputSignal?: AbortSignal): CloseFunction => {
  const abortController = new AbortController();
  const res = () => abortController.abort();
  res.signal = abortController.signal;
  if (inputSignal) {
    const removeAbortListener = onAbort(inputSignal, res);
    if (removeAbortListener) {
      res.signal.addEventListener("abort", removeAbortListener);
    }
  }
  return res;
};
