import { ChordsAndLyrics, LineType, LyricsLine, SIMPLE_ELEMENTS, Song } from "./type";

const needUnderscoreFillCharRegExp = /[^\s]$/;
const underscoreSpacesEndRegExp = /[\s_]+$/;

export function computeColumnWidths({ chords, lyrics }: ChordsAndLyrics, useExistingWidths) {
  const chordsLength = chords ? chords.length : 0;
  const lyricsLength = lyrics ? lyrics.length : 0;
  const columnWidths: number[] = [];
  for (let i = 0; i < chordsLength; i++) {
    const curChord = chords![i]!;
    let columnWidth = curChord.chord ? curChord.chord.length + 1 : 0;
    if (useExistingWidths && curChord.width! > 0) {
      columnWidth = Math.max(columnWidth, curChord.width!);
    }
    for (let v = 0; v < lyricsLength; v++) {
      const currentPart = lyrics![v].parts[i];
      if (currentPart) {
        columnWidth = Math.max(currentPart.length, columnWidth);
      }
    }
    columnWidths[i] = columnWidth;
  }
  return columnWidths;
}

export function applyColumnWidth(width: number, content = "", fillChar?: string) {
  if (width && content.length < width) {
    const missingChars = width - content.length;
    if (!fillChar) {
      fillChar = needUnderscoreFillCharRegExp.test(content) ? "_" : " ";
    }
    content += fillChar.repeat(missingChars);
  }
  return content;
}

export function formatLyrics(content: LyricsLine[], useExistingOffsets = true) {
  const lines: string[] = [];
  for (const item of content) {
    if (item.type === LineType.SectionHeader) {
      lines.push(`[${item.name}]`);
    } else if (item.type === LineType.Comment) {
      lines.push(`;${item.content}`);
    } else if (item.type === LineType.NewColumn || item.type === LineType.NewPage || item.type === LineType.EmptyLine) {
      lines.push(item.type);
    } else if (item.type === LineType.ChordsAndLyrics) {
      const columnWidths = computeColumnWidths(item, useExistingOffsets);
      const { chords, lyrics } = item;
      if (chords) {
        lines.push(`.${chords.map(({ chord }, index) => applyColumnWidth(columnWidths[index], chord, " ")).join("")}`.trimRight());
      }
      if (lyrics) {
        for (const line of lyrics) {
          lines.push(
            `${line.verse || " "}${line.parts.map((part, index) => applyColumnWidth(columnWidths[index], part)).join("")}`.replace(
              underscoreSpacesEndRegExp,
              ""
            )
          );
        }
      }
    }
  }
  return lines.join("\n");
}

const createSongDoc = () => {
  const parser = new DOMParser();
  return parser.parseFromString("<song></song>", "text/xml");
};

const appendField = (doc, name, content) => {
  const element = doc.createElement(name);
  doc.documentElement.appendChild(element);
  element.appendChild(doc.createTextNode(content || ""));
  return element;
};

export function format(song: Song) {
  const doc = createSongDoc();
  for (const element of SIMPLE_ELEMENTS) {
    appendField(doc, element, song[element]);
  }
  const capo = appendField(doc, "capo", song.capo);
  capo.setAttribute("print", song.capo_print ? "true" : "false");
  appendField(doc, "presentation", song.presentation ? song.presentation.join(" ") : "");
  appendField(doc, "lyrics", formatLyrics(song.lyrics));
  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
}
export default format;
