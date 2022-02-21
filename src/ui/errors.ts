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
