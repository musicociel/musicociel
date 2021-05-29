// cf https://www.chordpro.org/chordpro/

export enum LineType {
  Directive = "{",
  Comment = "#",
  ChordsAndLyrics = ".",
  EmptyLine = ""
}

export interface Directive {
  type: LineType.Directive;
  name: string;
  args?: string;
}

export interface Comment {
  type: LineType.Comment;
  content: string;
}

export interface ChordWithLyrics {
  chord?: string;
  lyrics: string;
}

export interface ChordsAndLyrics {
  type: LineType.ChordsAndLyrics;
  content: ChordWithLyrics[];
}

export interface EmptyLine {
  type: LineType.EmptyLine;
}

export type Line = Directive | Comment | ChordsAndLyrics | EmptyLine;
