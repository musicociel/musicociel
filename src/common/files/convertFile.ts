import { lazyLoaded } from "../lazyLoaded";
import { FileFormat } from "./formats/formats";

const converters = lazyLoaded<string, [any], any>({
  [`${FileFormat.CHORDPRO}>${FileFormat.TEXT}`]: () => import("./formats/chordpro/extractText"),
  [`${FileFormat.OPENSONG}>${FileFormat.TEXT}`]: () => import("./formats/opensong/extractText"),
  [`${FileFormat.OPENSONG}>${FileFormat.CHORDPRO}`]: () => import("./formats/opensong/toChordpro"),
  [`${FileFormat.CHORDPRO}>${FileFormat.OPENSONG}`]: () => import("./formats/chordpro/toOpensong")
});

export const convertFile = async (input: { format: FileFormat; content: any }, destinationFormat: FileFormat) => {
  if (input.format === destinationFormat) {
    return input;
  } else {
    const converterType = `${input.format}>${destinationFormat}`;
    const content = await converters(converterType, input.content);
    return {
      format: destinationFormat,
      content
    };
  }
};
