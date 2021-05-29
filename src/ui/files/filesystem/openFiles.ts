import { freeze, produce } from "immer";
import { writable, get } from "svelte/store";
import { FileSystemHandleKind, NativeEntryType, toFileSystemHandle } from "./fileSystemAccess";
import { loadFile } from "../viewFile";
import { v4 as uuid } from "uuid";
import { locationStore } from "../../router/history";
import type { OpenFile } from "../types";

const openedFilesWritable = writable<Record<string, OpenFile>>(freeze({}));
export const openedFilesList = { subscribe: openedFilesWritable.subscribe };

const openFileSystemFile = (entry: NativeEntryType) => {
  const fileHandlePromise = toFileSystemHandle(entry);
  return loadFile({
    async readFile() {
      const fileHandle = await fileHandlePromise;
      if (fileHandle.kind === FileSystemHandleKind.FILE) {
        return fileHandle.getFile();
      } else {
        return Promise.reject("not a file");
      }
    }
  });
};

const closeFileFactory = (id: string) => () => {
  openedFilesWritable.update(
    produce((filesList) => {
      delete filesList[id];
    })
  );
  if (get(locationStore).pathname.startsWith(`/local-file/${id}`)) {
    locationStore.navigate("/", true);
  }
};

export const openFiles = (files: NativeEntryType[]) => {
  let firstId: string | undefined;
  openedFilesWritable.update(
    produce((filesList) => {
      for (const file of files) {
        const id = uuid();
        const openFile = openFileSystemFile(file);
        if (!openFile.close.signal.aborted) {
          openFile.close.signal.addEventListener("abort", closeFileFactory(id));
          filesList[id] = openFile;
          if (!firstId) {
            firstId = id;
          }
        }
      }
    })
  );
  locationStore.navigate(`/local-file/${firstId}`);
};

window.addEventListener("beforeunload", (event) => {
  if (Object.keys(get(openedFilesWritable)).length > 0) {
    event.preventDefault();
    event.returnValue = "";
  }
});
