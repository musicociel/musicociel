import { lazyLoaded, MissingHandler } from "../lazyLoaded";
import { guessFormatFromExtension } from "./extensions";
import { readAsArrayBuffer, readAsText } from "./fileReader";
import { FileFormat, NamedBlob } from "./formats/formats";

// cf https://filesignatures.net/
const PDFFileStart = [0x25, 0x50, 0x44, 0x46 /* %PDF */];
const XMLFileStart = [0x3c, 0x3f, 0x78, 0x6d, 0x6c, 0x20 /* <?xml */];
const ChordProPossibleFileStart = [0x7b, 0x74, 0x3a /* {t: */];

const compareStart = (binaryArray: Uint8Array, comparison: number[]) => {
  if (binaryArray.length < comparison.length) {
    return false;
  }
  for (let i = 0, l = comparison.length; i < l; i++) {
    if (binaryArray[i] !== comparison[i]) {
      return false;
    }
  }
  return true;
};

export const guessFileFormat = async (blob: NamedBlob) => {
  const start = new Uint8Array(await blob.slice(0, 6).arrayBuffer());
  if (compareStart(start, XMLFileStart)) {
    return FileFormat.OPENSONG;
  }
  if (compareStart(start, PDFFileStart)) {
    return FileFormat.PDF;
  }
  if (compareStart(start, ChordProPossibleFileStart)) {
    return FileFormat.CHORDPRO;
  }
  const fileName = blob.name;
  if (fileName) {
    return guessFormatFromExtension(fileName);
  }
};

const textBasedFormats = lazyLoaded<FileFormat, [string], any>({
  [FileFormat.TEXT]: () => import("./formats/text/identity"),
  [FileFormat.CHORDPRO]: () => import("./formats/chordpro/parse"),
  [FileFormat.OPENSONG]: () => import("./formats/opensong/parse")
});

const binaryBasedFormats = lazyLoaded<FileFormat, [Uint8Array], any>({});

export const openFile = async (file: NamedBlob, { signal, format }: { signal?: AbortSignal; format?: FileFormat } = {}) => {
  if (!format) {
    format = await guessFileFormat(file);
    if (!format) {
      throw new Error("Unrecognized file format");
    }
  }
  if (binaryBasedFormats.has(format)) {
    const binary = new Uint8Array(await readAsArrayBuffer(file, { signal }));
    const content = await binaryBasedFormats(format, binary);
    return {
      format,
      content
    };
  }
  if (textBasedFormats.has(format)) {
    const text = await readAsText(file, { signal });
    const content = await textBasedFormats(format, text);
    return {
      format,
      content
    };
  }

  throw new MissingHandler(format);
};
