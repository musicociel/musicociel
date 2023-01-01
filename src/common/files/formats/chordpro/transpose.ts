import type { AlterationsType } from "../../../music/chords";
import { NoteStyle, processChords } from "../../../music/chords";
import type { Line } from "./type";
import { LineType } from "./type";

export function transpose(content: Line[], { transpose, alterationType }: { transpose: number; alterationType: AlterationsType }): Line[] {
  return content.map((line) => {
    if (line.type === LineType.ChordsAndLyrics) {
      return {
        type: LineType.ChordsAndLyrics,
        content: line.content.map((value) => {
          if (value.chord) {
            return {
              chord: processChords(value.chord, transpose, NoteStyle.CDE, alterationType),
              lyrics: value.lyrics
            };
          }
          return value;
        })
      };
    }
    return line;
  });
}
export default transpose;
