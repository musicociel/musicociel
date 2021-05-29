import { openFiles } from "./openFiles";

const extractFile = (item: DataTransferItem) => {
  if ((item as any).getAsFileSystemHandle) {
    return (item as any).getAsFileSystemHandle();
  } else if (item.webkitGetAsEntry) {
    return item.webkitGetAsEntry();
  } else if ((item as any).getAsEntry) {
    return (item as any).getAsEntry();
  } else {
    return item.getAsFile();
  }
};

export const registerFileHandlers = () => {
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const items: any[] = [];
    for (const item of e.dataTransfer!.items) {
      if (item.kind === "file") {
        items.push(extractFile(item));
      }
    }
    if (items.length > 0) {
      openFiles(items);
    }
  });

  if ("launchQueue" in window) {
    (window as any).launchQueue.setConsumer((launchParams) => {
      openFiles(launchParams.files);
    });
  }
};
