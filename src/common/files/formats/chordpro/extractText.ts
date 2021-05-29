import { Line, LineType } from "./type";

const isTitle = (name: string) => name === "title" || name === "t" || name === "subtitle" || name === "st";

export function format(content: Line[]) {
  return content
    .map((line) => {
      if (line.type === LineType.Directive && isTitle(line.name)) {
        return line.args ? `${line.args}\n` : "";
      }
      // TODO: handle all meta directives
      if (line.type === LineType.EmptyLine) {
        return "\n";
      }
      if (line.type === LineType.ChordsAndLyrics) {
        return `${line.content
          .map(({ lyrics }) => lyrics)
          .join("")
          .trim()}\n`;
      }
      return "";
    })
    .join("")
    .replace(/\n(\n)+/g, "\n\n");
}
export default format;
