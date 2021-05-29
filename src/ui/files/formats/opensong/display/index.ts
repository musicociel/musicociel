import type { Song } from "../../../../../common/files/formats/opensong/type";
import type { ViewerInterface } from "../../../types";
import OpensongDisplay from "./OpensongDisplay.svelte";

export default (content: ViewerInterface<Song>) => {
  return {
    data: content,
    component: OpensongDisplay
  };
};
