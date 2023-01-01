import type { AlterationsType } from "../../../music/chords";
import { NoteStyle, processChords } from "../../../music/chords";
import type { LyricsLine, Song } from "./type";
import { LineType } from "./type";

export function transposeLyrics(
  content: LyricsLine[],
  { transpose, alterationType }: { transpose: number; alterationType: AlterationsType }
): LyricsLine[] {
  return content.map((line) => {
    if (line.type === LineType.ChordsAndLyrics) {
      return {
        type: LineType.ChordsAndLyrics,
        lyrics: line.lyrics,
        chords: line.chords?.map((value) => {
          if (value.chord) {
            return {
              ...value,
              chord: processChords(value.chord, transpose, NoteStyle.CDE, alterationType)
            };
          }
          return value;
        })
      };
    }
    return line;
  });
}

export function transpose(content: Song, transposeOptions: { transpose: number; alterationType: AlterationsType }): Song {
  return {
    ...content,
    lyrics: transposeLyrics(content.lyrics, transposeOptions)
  };
}
export default transpose;
