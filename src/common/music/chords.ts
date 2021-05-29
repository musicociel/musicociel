export const notes = [
  ["Do", "C"],
  ["Ré", "D", "Re"],
  ["Mi", "E"],
  ["Fa", "F"],
  ["Sol", "G"],
  ["La", "A"],
  ["Si", "B", "Ti"]
];
export const notesPosition = [0, 2, 4, 5, 7, 9, 11];
export const alterations = [
  ["bb", "\uD834\uDD2B", "\u266D\u266D"],
  ["b", "\u266D"],
  ["", "", "\u266E"],
  ["#", "\u266F"],
  ["##", "\uD834\uDD2A", "\u266F\u266F"]
];
export const notesRegExp =
  /\b(Do|Ré|Re|Mi|Fa|Sol|La|Si|Ti|C|D|E|F|G|A|B)(\uD834\uDD2B|\u266D\u266D|bb|\uD834\uDD2A|\u266F\u266F|##|\u266D|b|\u266F|#|\u266E|)/gi;
const toMap = (array: string[][]) => {
  const map: Record<string, [number, number]> = Object.create(null);
  array.forEach((note, noteIndex) => note.forEach((item, itemIndex) => (map[item.toLowerCase()] = [noteIndex, itemIndex])));
  return map;
};
export const notesMap = toMap(notes);
export const alterationsMap = toMap(alterations);

export enum NoteStyle {
  Keep = -1,
  DoReMi = 0,
  CDE = 1
}

export enum AlterationsType {
  Bemol = -1,
  Sharp = 1
}

export const mod12 = (inputPitch: number) => {
  inputPitch = inputPitch % 12;
  if (inputPitch < 0) {
    inputPitch += 12;
  }
  return inputPitch;
};

export const processChords = (
  input: string,
  transpose: number,
  notesStyle: NoteStyle,
  alterationsType: AlterationsType,
  dedicatedAlterations = false
) => {
  transpose = mod12(transpose);
  if (!input || (transpose === 0 && notesStyle === NoteStyle.Keep)) {
    // nothing to do in this case
    return input;
  }
  return input.replace(notesRegExp, (match, note, alteration) => {
    const noteInfo = notesMap[note.toLowerCase()];
    const alterationInfo = alterationsMap[alteration];
    if (noteInfo && alterationInfo) {
      const newStyle = notesStyle === NoteStyle.Keep ? (noteInfo[1] === 1 ? 1 : 0) : notesStyle;
      if (transpose === 0) {
        return `${notes[noteInfo[0]][newStyle]}${alteration}`;
      }
      const newPosition = mod12(notesPosition[noteInfo[0]] + alterationInfo[0] - 2 + transpose);
      let newNote = notesPosition.indexOf(newPosition);
      let newAlteration = 0;
      if (newNote === -1) {
        newAlteration = alterationsType;
        newNote = notesPosition.indexOf(newPosition - newAlteration);
      }
      return `${notes[newNote][newStyle]}${alterations[newAlteration + 2][dedicatedAlterations ? 1 : 0]}`;
    }
    return match;
  });
};
