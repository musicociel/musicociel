import { writable } from "@amadeus-it-group/tansu";
import { AlterationsType, NoteStyle } from "../../common/music/chords";

export const notesStyle = writable(NoteStyle.Keep);
export const transpose = writable(0);
export const alterationsType = writable(AlterationsType.Sharp);
export const showChords = writable(true);
