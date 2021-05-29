import { abortError } from "../abortError";
import { onAbort } from "../closeFunction";

const readerFactory =
  typeof FileReader !== "undefined"
    ? <T extends string | ArrayBuffer>(startReading: (reader: FileReader, blob: Blob) => void, reader: (blob: Blob) => Promise<T>) =>
        (blob: Blob, { signal }: { signal?: AbortSignal } = {}) =>
          new Promise<T>((resolve, reject) => {
            const reader = new FileReader();
            const removeAbortListener = onAbort(signal, () => {
              reject(abortError());
              reader.abort();
            });
            if (!removeAbortListener) {
              return;
            }
            reader.onload = function () {
              removeAbortListener();
              resolve(reader.result as T);
            };
            reader.onerror = function () {
              removeAbortListener();
              reject(reader.error);
            };
            startReading(reader, blob);
          })
    : <T extends string | ArrayBuffer>(startReading: (reader: FileReader, blob: Blob) => void, reader: (blob: Blob) => Promise<T>) => reader;

export const readAsText = readerFactory<string>(
  (reader, blob) => reader.readAsText(blob),
  (blob: Blob) => blob.text()
);
export const readAsArrayBuffer = readerFactory<ArrayBuffer>(
  (reader, blob) => reader.readAsArrayBuffer(blob),
  (blob: Blob) => blob.arrayBuffer()
);
