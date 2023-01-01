import type { Line as ChordproLine, ChordsAndLyrics as ChorproChordsAndLyrics } from "./type";
import { LineType as ChordproLineType } from "./type";
import type {
  Song,
  ChordsAndLyrics as OpensongChordsAndLyrics,
  LyricsLine as OpensongLine,
  Chord as OpensongChord,
  VerseLyrics as OpensongVerseLyrics
} from "../opensong/type";
import { LineType as OpensongLineType } from "../opensong/type";

const convertChordsAndLyrics = ({ content }: ChorproChordsAndLyrics): OpensongChordsAndLyrics => {
  const parts: string[] = [];
  const chords: OpensongChord[] = [];
  const lyrics: OpensongVerseLyrics[] = [{ parts }];
  for (const item of content) {
    chords.push({ chord: item.chord });
    parts.push(item.lyrics);
  }
  return {
    type: OpensongLineType.ChordsAndLyrics,
    chords,
    lyrics
  };
};

export const toOpensong = (song: ChordproLine[]): Song => {
  // TODO: sections, new lines, new columns, new pages...
  const lyrics: OpensongLine[] = [];
  for (const item of song) {
    if (item.type === ChordproLineType.ChordsAndLyrics) {
      lyrics.push(convertChordsAndLyrics(item));
    }
  }

  return {
    // TODO: metadata
    lyrics
  };
};

export default toOpensong;
