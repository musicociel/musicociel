import { LineType, LyricsLine } from "./type";

export interface Section {
  definition: number;
  start: number;
  end: number;
  name: string;
  chords: any[];
  verses: any[];
}

export const getStructure = (content: LyricsLine[]) => {
  let hasChords = false;
  let hasComments = false;
  let hasCompactedVerses = false;
  let currentSection: Section | undefined;
  const sections: Section[] = [];
  if (content.length > 0 && content[0].type !== LineType.SectionHeader) {
    // implicit section in case there is none at the beginning
    currentSection = {
      definition: -1,
      start: 0,
      end: 0,
      name: "",
      chords: [],
      verses: []
    };
    sections.push(currentSection);
  }
  for (let i = 0, l = content.length; i < l; i++) {
    const line = content[i];
    if (line.type === LineType.SectionHeader) {
      if (currentSection) {
        currentSection.end = i - 1;
      }
      currentSection = { definition: i, start: i + 1, end: 0, name: line.name, chords: [], verses: [] };
      sections.push(currentSection);
    } else if (line.type === LineType.ChordsAndLyrics) {
      if (line.chords) {
        for (const chord of line.chords) {
          if (chord && chord.chord) {
            hasChords = true;
            currentSection!.chords.push(chord.chord);
          }
        }
      }
      if (line.lyrics) {
        for (const item of line.lyrics) {
          const verse = item.verse;
          if (!currentSection!.verses.includes(verse)) {
            currentSection!.verses.push(verse);
            if (verse) {
              hasCompactedVerses = true;
            }
          }
        }
      }
    } else if (line.type === LineType.Comment) {
      hasComments = true;
    }
  }
  if (currentSection) {
    currentSection.end = content.length - 1;
  }
  return {
    hasCompactedVerses,
    hasComments,
    hasChords,
    sections
  };
};

export const expand = (content: LyricsLine[], { sections } = getStructure(content)) => {
  const output: LyricsLine[] = [];
  for (const section of sections) {
    const verses = section.verses;
    for (const verse of verses) {
      const sectionName = `${section.name}${verse || ""}`;
      if (verses.length > 1 || section.definition > -1) {
        output.push({ type: LineType.SectionHeader, name: sectionName });
      }
      for (let i = section.start, imax = section.end; i <= imax; i++) {
        const line = content[i];
        if (line.type === LineType.ChordsAndLyrics) {
          output.push({
            type: LineType.ChordsAndLyrics,
            chords: line.chords,
            lyrics: line.lyrics
              ? line.lyrics.filter((lineLyrics) => lineLyrics.verse === verse).map(({ parts }) => ({ verse: undefined, parts }))
              : line.lyrics
          });
        } else if (line.type === LineType.Comment) {
          output.push(line);
        } else if (line.type === LineType.EmptyLine) {
          const previousLine = content[i - 1];
          const previousLineCompacted =
            previousLine && previousLine.type === LineType.ChordsAndLyrics && previousLine.lyrics && previousLine.lyrics.length > 1;
          if (!previousLineCompacted) {
            output.push(line);
          }
        } else if (line.type === LineType.NewPage || line.type === LineType.NewColumn) {
          if (verses.length <= 1) {
            output.push(line);
          }
        }
      }
    }
  }
  return output;
};
