import { asReadable, writable } from "@amadeus-it-group/tansu";

const errorsWritable = writable([] as any[]);

export function notifyError(error: any) {
  errorsWritable.update((array) => [...array, error]);
}

export function closeError(error: any) {
  errorsWritable.update((array) => array.filter((e) => e != error));
}

export const errors = asReadable(errorsWritable);

// TODO: improve error handling (translation, generic network errors, ...)
export async function extractErrorMessage(error: any) {
  if (error instanceof Response) {
    try {
      const json = await error.json();
      return json?.message ?? "Request error";
    } catch (error) {
      return "Request error";
    }
  } else {
    return error ?? "Unknown error";
  }
}
