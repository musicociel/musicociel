import type { ChordWithLyrics, Line } from "./type";
import { LineType } from "./type";

const newLineRegExp = /\r\n|\n\r|\r|\n/;
const directiveRegExp = /^\{([_a-z]+)(?:[:\s](.*))?\}$/;
const chordRegExp = /\[([^\]]+)\]/g;

export function parse(fileContent: string) {
  const lines = fileContent.split(newLineRegExp);
  const content: Line[] = [];
  for (const curLine of lines) {
    const firstChar = curLine.charAt(0);
    if (firstChar == "{" && curLine.charAt(curLine.length - 1) == "}") {
      // directive
      const match = directiveRegExp.exec(curLine)!;
      content.push({ type: LineType.Directive, name: match[1], args: match[2] });
    } else if (firstChar == "#") {
      // comment
      content.push({ type: LineType.Comment, content: curLine.substring(1) });
    } else if (!firstChar) {
      // empty line
      content.push({ type: LineType.EmptyLine });
    } else {
      // lyrics/chords
      const textContent: ChordWithLyrics[] = [];
      let lastChord: string | undefined = undefined;
      let lastMatchEndIndex = 0;
      const addTextContent = (end) => {
        if (end > 0) {
          const lyrics = curLine.substring(lastMatchEndIndex, end);
          textContent.push({ lyrics, chord: lastChord });
        }
      };
      curLine.replace(chordRegExp, (match, chord, offset) => {
        addTextContent(offset);
        lastChord = chord;
        lastMatchEndIndex = offset + match.length;
        return match;
      });
      addTextContent(curLine.length);
      content.push({
        type: LineType.ChordsAndLyrics,
        content: textContent
      });
    }
  }
  return content;
}
export default parse;
