import type { ReadableSignal, WritableSignal } from "@amadeus-it-group/tansu";
import type { CloseFunction } from "../../common/closeFunction";
import type { FileFormat, NamedBlob } from "../../common/files/formats/formats";

export interface ViewerData<T = any> {
  component?: any;
  data?: T;
  error?: any;
}

export interface Viewer<T = any> extends ReadableSignal<ViewerData<T>> {
  close: CloseFunction;
}

export interface OpenFileData<T = any> {
  error?: any;
  file?: NamedBlob;
  format?: FileFormat;
  content?: T;
  viewers: Record<string, Viewer>;
}

export interface ViewerInterface<T = any> extends WritableSignal<OpenFileData<T>> {
  close: CloseFunction;
}

export interface OpenFile extends ReadableSignal<OpenFileData> {
  getViewer: (name: string) => Viewer | null;
  selected: WritableSignal<boolean>;
  close: CloseFunction;
}

export interface FileAccess {
  readFile: (signal: AbortSignal) => Promise<NamedBlob>;
  writeFile?: (blob: Blob) => Promise<void>;
}
