export enum FileSystemHandleKind {
  FILE = "file",
  DIRECTORY = "directory"
}

interface FileSystemHandleBase {
  name: string;
}

export interface FileSystemFileHandle extends FileSystemHandleBase {
  kind: FileSystemHandleKind.FILE;
  getFile(): Promise<File>;
}

export const isFileSystemFileHandle = (x: any): x is FileSystemFileHandle => {
  return x && x.kind === FileSystemHandleKind.FILE;
};

export interface FileSystemDirectoryHandle extends FileSystemHandleBase {
  kind: FileSystemHandleKind.DIRECTORY;
}

export const isFileSystemDirectoryHandle = (x: any): x is FileSystemDirectoryHandle => {
  return x && x.kind === FileSystemHandleKind.DIRECTORY;
};

export interface FileSystemDirectoryEntry {
  isFile: false;
  isDirectory: true;
  name: string;
}

export const isFileSystemDirectoryEntry = (x: any): x is FileSystemDirectoryEntry => {
  return x && x.isDirectory === true;
};

export interface FileSystemFileEntry {
  isFile: true;
  isDirectory: false;
  name: string;
  file(success: (file: File) => void, error?: (error: any) => void): void;
}

export const isFileSystemFileEntry = (x: any): x is FileSystemFileEntry => {
  return x && x.isFile === true;
};

export const fileSystemFileEntryToFile = (item: FileSystemFileEntry) => {
  return new Promise<File>((resolve, reject) => item.file(resolve, reject));
};

export const isFile = (x: any): x is File => {
  return x instanceof File;
};

export type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;
export type NativeEntryType = FileSystemFileHandle | FileSystemDirectoryHandle | FileSystemFileEntry | FileSystemDirectoryEntry | File;

const assertFailed = (input: never): Error => new Error("Assert failed");

export const toFileSystemHandle = async (input: NativeEntryType | Promise<NativeEntryType>): Promise<FileSystemHandle> => {
  const entry = await input;
  if (isFileSystemFileHandle(entry)) {
    return entry;
  } else if (isFileSystemDirectoryHandle(entry)) {
    return entry;
  } else if (isFileSystemFileEntry(entry)) {
    return {
      kind: FileSystemHandleKind.FILE,
      name: entry.name,
      async getFile() {
        return fileSystemFileEntryToFile(entry);
      }
    };
  } else if (isFileSystemDirectoryEntry(entry)) {
    return {
      kind: FileSystemHandleKind.DIRECTORY,
      name: entry.name
    };
  } else if (isFile(entry)) {
    return {
      kind: FileSystemHandleKind.FILE,
      name: entry.name,
      async getFile() {
        return entry;
      }
    };
  } else {
    throw assertFailed(entry);
  }
};
