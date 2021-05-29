// cf http://www.opensong.org/home/file-formats

export enum LineType {
  SectionHeader = "[",
  ChordsAndLyrics = ".",
  Comment = ";",
  NewColumn = "---",
  NewPage = "-!!",
  EmptyLine = ""
}

export interface SectionHeader {
  type: LineType.SectionHeader;
  name: string;
}

export interface VerseLyrics {
  verse?: string;
  parts: string[];
}

export interface Chord {
  chord?: string;
  width?: number;
}

export interface ChordsAndLyrics {
  type: LineType.ChordsAndLyrics;
  lyrics?: VerseLyrics[];
  chords?: Chord[];
}

export interface Comment {
  type: LineType.Comment;
  content: string;
}

export interface Separation {
  type: LineType.NewColumn | LineType.NewPage | LineType.EmptyLine;
}

export type LyricsLine = SectionHeader | ChordsAndLyrics | Comment | Separation;

export interface Song {
  title?: string;
  author?: string;
  copyright?: string;
  hymn_number?: string;
  tempo?: string;
  timesig?: string;
  ccli?: string;
  user1?: string;
  user2?: string;
  user3?: string;
  key?: string;
  aka?: string;
  key_line?: string;
  lyrics: LyricsLine[];
  capo?: number;
  capo_print?: boolean;
  presentation?: string[];

  // TODO:
  // theme
  // linked_songs
}

export const SIMPLE_ELEMENTS: (keyof Song)[] = [
  "title",
  "author",
  "copyright",
  "hymn_number",
  "tempo",
  "timesig",
  "ccli",
  "user1",
  "user2",
  "user3",
  "key",
  "aka",
  "key_line"
];
