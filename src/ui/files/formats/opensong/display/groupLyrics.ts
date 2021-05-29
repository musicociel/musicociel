import type { LyricsLine } from "../../../../../common/files/formats/opensong/type";
import { LineType } from "../../../../../common/files/formats/opensong/type";

export interface LyricsGroup {
  spaceBefore: boolean;
  lines: LyricsLine[];
}

export function groupLyrics(lyrics: LyricsLine[]) {
  const res: LyricsGroup[] = [];
  let lastItemSpace = false;
  let lastSectionItem: LyricsLine | null = null;
  for (const item of lyrics) {
    const type = item.type;
    if (type === LineType.EmptyLine || type === LineType.NewColumn || type === LineType.NewPage) {
      lastItemSpace = true;
    } else if (type === LineType.SectionHeader) {
      lastSectionItem = item;
    } else {
      res.push({
        spaceBefore: !!(lastItemSpace || lastSectionItem),
        lines: lastSectionItem ? [lastSectionItem, item] : [item]
      });
      lastItemSpace = false;
      lastSectionItem = null;
    }
  }
  return res;
}
