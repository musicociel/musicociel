import { lazyLoaded } from "../lazyLoaded";
import { FileFormat } from "./formats/formats";

const saveContent = lazyLoaded<FileFormat, [any], string | Uint8Array | ArrayBuffer | Blob>({
  [FileFormat.TEXT]: () => import("./formats/text/identity"),
  [FileFormat.CHORDPRO]: () => import("./formats/chordpro/format"),
  [FileFormat.OPENSONG]: () => import("./formats/opensong/format")
});

export const saveFile = async ({ format, content }: { format: FileFormat; content: any }): Promise<Blob> => {
  const output = await saveContent(format, content);
  return new Blob([output]);
};
