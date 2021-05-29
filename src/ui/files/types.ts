import type { Readable, Writable } from "svelte/store";
import type { CloseFunction } from "../../common/closeFunction";
import type { FileFormat, NamedBlob } from "../../common/files/formats/formats";

export interface ViewerData<T = any> {
  component?: any;
  data?: T;
  error?: any;
}

export interface Viewer<T = any> extends Readable<ViewerData<T>> {
  close: CloseFunction;
}

export interface OpenFileData<T = any> {
  error?: any;
  file?: NamedBlob;
  format?: FileFormat;
  content?: T;
  viewers: Record<string, Viewer>;
}

export interface ViewerInterface<T = any> extends Writable<OpenFileData<T>> {
  close: CloseFunction;
}

export interface OpenFile extends Readable<OpenFileData> {
  getViewer: (name: string) => Viewer | null;
  close: CloseFunction;
}

export interface FileAccess {
  readFile: (signal: AbortSignal) => Promise<NamedBlob>;
  writeFile?: (blob: Blob) => Promise<void>;
}
