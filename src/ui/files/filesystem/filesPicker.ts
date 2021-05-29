import { openFiles } from "./openFiles";

let fileInput: HTMLInputElement;
const getFileInput = () => {
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("multiple", "true");
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.addEventListener("change", () => {
      const files = fileInput.files;
      if (files) {
        openFiles([...files]);
      }
    });
  }
  fileInput.value = null as any;
  return fileInput;
};

export const openFilesPicker = async () => {
  const win: any = window;
  if (win.showOpenFilePicker) {
    let files;
    try {
      files = await win.showOpenFilePicker({ multiple: true });
    } catch (error) {
      return;
    }
    if (files) {
      openFiles(files);
    }
  } else {
    getFileInput().click();
  }
};
