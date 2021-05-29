import { Chord, LineType, LyricsLine, SIMPLE_ELEMENTS, Song } from "./type";

const newLineRegExp = /\r\n|\n\r|\r|\n/;
const correctLyricsFirstCharRegExp = /^[0-9 ]$/;
const chordRegExp = /[^\s|]+/g;

const spaceRegExp = /\s+/;

const underscoresRegExp = /_+/g;
const rightSpacesRegExp = /\s+$/;
const pipesRegExp = /\|+/g;

export function removeControlChars(text) {
  return text.replace(underscoresRegExp, "").replace(pipesRegExp, " ").replace(rightSpacesRegExp, " ");
}

export function parseLyrics(lyrics: string) {
  const lines = lyrics.split(newLineRegExp);
  const content: LyricsLine[] = [];
  for (let curLine of lines) {
    curLine = curLine.trimEnd();
    const firstChar = curLine.charAt(0);
    if (firstChar == "[" && curLine.charAt(curLine.length - 1) == "]") {
      // section
      content.push({ type: LineType.SectionHeader, name: curLine.substring(1, curLine.length - 1) });
    } else if (firstChar === ";") {
      // comment
      content.push({ type: LineType.Comment, content: curLine.substring(1) });
    } else if (curLine === LineType.NewColumn || curLine === LineType.NewPage || curLine === LineType.EmptyLine) {
      content.push({ type: curLine });
    } else if (firstChar === ".") {
      // chords
      let currentOffset = 0;
      let chords: Chord[] = [{}];
      curLine.substring(1).replace(chordRegExp, (chord, offset) => {
        if (offset === 0) {
          chords = [];
        } else {
          chords[chords.length - 1].width = offset - currentOffset;
        }
        chords.push({ chord });
        currentOffset = offset;
        return chord;
      });
      content.push({ type: LineType.ChordsAndLyrics, chords });
    } else {
      // lyrics
      let fixFirstChar = false;
      curLine = curLine.substring(1);
      const parts: string[] = [];
      let lastChordOffset = 0;
      const addPart = (width) => {
        if (width > 0 && lastChordOffset < curLine.length) {
          const newLastChordOffset = lastChordOffset + width;
          let lyrics = curLine.substring(lastChordOffset, newLastChordOffset);
          if (lastChordOffset === 0 && fixFirstChar) {
            lyrics = firstChar + lyrics;
          }
          lastChordOffset = newLastChordOffset;
          parts.push(lyrics);
        }
      };
      const lastChords = content[content.length - 1];
      if (!lastChords || lastChords.type !== LineType.ChordsAndLyrics || !lastChords.chords) {
        fixFirstChar = firstChar !== " ";
        content.push({
          type: LineType.ChordsAndLyrics,
          lyrics: [{ verse: undefined, parts }]
        });
      } else {
        fixFirstChar = !correctLyricsFirstCharRegExp.test(firstChar);
        for (const chord of lastChords.chords) {
          addPart(chord.width);
        }
        if (!lastChords.lyrics) lastChords.lyrics = [];
        lastChords.lyrics.push({
          verse: fixFirstChar || firstChar === " " ? undefined : firstChar,
          parts
        });
      }
      if (curLine.length > lastChordOffset) {
        addPart(curLine.length - lastChordOffset);
      }
    }
  }
  return content;
}

const identity = <T>(a: T) => a;

const getXMLTagContent = (doc: XMLDocument, tag: string, transform: (a: string, element: Element) => any = identity) => {
  const element = doc.getElementsByTagName(tag)[0];
  return element ? transform(element.textContent || "", element) : "";
};

const setJsonFromTag = <T>(doc: XMLDocument, tag: string & keyof T, json: T, transform?: (a: string, element: Element) => any) => {
  const value = getXMLTagContent(doc, tag, transform);
  if (value) {
    json[tag] = value;
  }
};

export function parse(fileContent: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fileContent, "text/xml");
  const rootEltName = doc.documentElement.nodeName;
  if (rootEltName !== "song") {
    throw new Error(`Unexpected root element: ${rootEltName}`);
  }
  const res: Song = {
    lyrics: parseLyrics(getXMLTagContent(doc, "lyrics"))
  };
  for (const element of SIMPLE_ELEMENTS) {
    setJsonFromTag(doc, element, res);
  }
  setJsonFromTag(doc, "presentation", res, (value) => (value ? value.split(spaceRegExp) : null));
  setJsonFromTag(doc, "capo", res, (capo, element) => {
    if (element.getAttribute("print") === "true") res.capo_print = true;
    return +capo;
  });
  return res;
}

export default parse;
