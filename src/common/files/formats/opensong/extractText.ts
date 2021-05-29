import { removeControlChars } from "./parse";
import { LineType, LyricsLine, Song } from "./type";
import { expand, getStructure } from "./util";

export const extractTextFromLyrics = (content: LyricsLine[], structure = getStructure(content)) => {
  if (structure.hasCompactedVerses) {
    content = expand(content, structure);
  }
  const output: string[] = [];
  let needEmptyLine = false;
  for (const line of content) {
    if (line.type === LineType.ChordsAndLyrics) {
      for (const lyricsLine of line.lyrics || []) {
        const text = lyricsLine.parts.map(removeControlChars).join("");
        if (text) {
          if (needEmptyLine && output.length > 0) {
            output.push("");
          }
          output.push(text);
          needEmptyLine = false;
        }
      }
    } else if (
      line.type === LineType.SectionHeader ||
      line.type === LineType.EmptyLine ||
      line.type === LineType.NewColumn ||
      line.type === LineType.NewPage
    ) {
      needEmptyLine = true;
    }
  }
  return output.join("\n");
};

export function extractText(song: Song) {
  const textFromLyrics = extractTextFromLyrics(song.lyrics);
  return `${song.title || ""}\n${song.author || ""}\n\n${textFromLyrics}`;
}
export default extractText;
