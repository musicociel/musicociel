import type { Line } from "../../../../../common/files/formats/chordpro/type";
import type { ViewerInterface } from "../../../types";
import ChordproDisplay from "./ChordproDisplay.svelte";

export default (content: ViewerInterface<Line[]>) => {
  return {
    data: content,
    component: ChordproDisplay
  };
};
