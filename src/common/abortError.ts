export const ABORT_ERROR_NAME = "AbortError";

export const abortError = () => {
  const error = new Error();
  error.name = ABORT_ERROR_NAME;
  return error;
};

export const isAbortError = (error: any) => error && error.name === ABORT_ERROR_NAME;
