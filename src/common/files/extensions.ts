import { FileFormat } from "./formats/formats";

// cf also extensions declared in manifest.json

const chordProRegExp = /\.(chordpro|cho|crd|chopro|chord|pro)$/i;
const pdfRegExp = /\.(pdf)$/i;
const htmlRegExp = /\.(html?)$/i;
const textRegExp = /\.(txt)$/i;

export const guessFormatFromExtension = (fileName: string) => {
  if (chordProRegExp.test(fileName)) {
    return FileFormat.CHORDPRO;
  }
  if (pdfRegExp.test(fileName)) {
    return FileFormat.PDF;
  }
  if (htmlRegExp.test(fileName)) {
    return FileFormat.HTML;
  }
  if (textRegExp.test(fileName)) {
    return FileFormat.TEXT;
  }
};
