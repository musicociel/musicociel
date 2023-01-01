import type {
  Line as ChordproLine,
  Directive,
  ChordsAndLyrics as ChorproChordsAndLyrics,
  ChordWithLyrics as ChorproChordWithLyrics
} from "../chordpro/type";
import { LineType as ChordproLineType } from "../chordpro/type";
import { removeControlChars } from "./parse";
import type { ChordsAndLyrics as OpensongChordsAndLyrics, LyricsLine as OpensongLine, SectionHeader, Song } from "./type";
import { LineType as OpensongLineType } from "./type";
import { expand, getStructure } from "./util";

const convertSection = (sectionHeader: SectionHeader | undefined): Directive[] => {
  if (!sectionHeader) return [];
  // TODO: improve type to use either chorus/bridge/verse/...
  const type = "v";
  const name = sectionHeader.name;
  return [
    { type: ChordproLineType.Directive, name: `so${type}`, args: name },
    { type: ChordproLineType.Directive, name: `eo${type}` }
  ];
};

const convertChordsAndLyrics = ({ chords, lyrics }: OpensongChordsAndLyrics): ChorproChordsAndLyrics => {
  const content: ChorproChordWithLyrics[] = [];
  for (let i = 0, l = Math.max(chords?.length ?? 0, lyrics?.[0]?.parts.length ?? 0); i < l; i++) {
    content.push({ chord: chords?.[i].chord, lyrics: removeControlChars(lyrics?.[0]?.parts?.[i] ?? "") });
  }
  return {
    type: ChordproLineType.ChordsAndLyrics,
    content
  };
};

export const lyricsToChordpro = (content: OpensongLine[], structure = getStructure(content)) => {
  const res: ChordproLine[] = [];
  if (structure.hasCompactedVerses) {
    content = expand(content, structure);
    structure = getStructure(content);
  }
  for (const section of structure.sections) {
    const definition = section.definition > -1 ? (content[section.definition] as SectionHeader) : undefined;
    const [sectionBegin, sectionEnd] = convertSection(definition);
    if (sectionBegin) {
      res.push(sectionBegin);
    }
    for (let i = section.start, l = section.end; i <= l; i++) {
      const item = content[i];
      if (item.type === OpensongLineType.ChordsAndLyrics) {
        res.push(convertChordsAndLyrics(item));
      } else if (item.type === OpensongLineType.Comment) {
        res.push({
          type: ChordproLineType.Comment,
          content: item.content
        });
      } else if (item.type === OpensongLineType.EmptyLine) {
        res.push({
          type: ChordproLineType.EmptyLine
        });
      } else if (item.type === OpensongLineType.NewColumn) {
        res.push({
          type: ChordproLineType.Directive,
          name: "column_break"
        });
      } else if (item.type === OpensongLineType.NewPage) {
        res.push({
          type: ChordproLineType.Directive,
          name: "new_page"
        });
      }
    }
    // TODO: improve output with blank space after end of section rather than just before
    if (sectionEnd) {
      res.push(sectionEnd);
    }
  }
  return res;
};

export const toChordpro = (song: Song) => {
  // TODO: metadata
  return [...lyricsToChordpro(song.lyrics)];
};

export default toChordpro;
