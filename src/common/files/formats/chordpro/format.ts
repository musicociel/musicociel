import { Line, LineType } from "./type";

export function format(content: Line[]) {
  return content
    .map((line) => {
      if (line.type === LineType.Directive) {
        return line.args ? `{${line.name}:${line.args}}` : `{${line.name}}`;
      }
      if (line.type === LineType.Comment) {
        return `#${line.content}`;
      }
      if (line.type === LineType.EmptyLine) {
        return "";
      }
      if (line.type === LineType.ChordsAndLyrics) {
        return line.content.map(({ lyrics, chord }) => (chord != null ? `[${chord}]${lyrics}` : lyrics)).join("");
      }
    })
    .join("\n");
}
export default format;
