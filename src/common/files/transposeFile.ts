import type { AlterationsType } from "../music/chords";
import { lazyLoaded } from "../lazyLoaded";
import { FileFormat } from "./formats/formats";

const transposers = lazyLoaded<string, [any, any], any>({
  [FileFormat.CHORDPRO]: () => import("./formats/chordpro/transpose"),
  [FileFormat.OPENSONG]: () => import("./formats/opensong/transpose")
});

export const transposeFile = async (
  input: { format: FileFormat; content: any },
  transposeOptions: { transpose: number; alterationType: AlterationsType }
) => {
  return {
    format: input.format,
    content: await transposers(input.format, input.content, transposeOptions)
  };
};
