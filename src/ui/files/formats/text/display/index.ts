import type { ViewerInterface } from "../../../types";
import TextDisplay from "./TextDisplay.svelte";

export default (content: ViewerInterface<string>) => {
  return {
    data: content,
    component: TextDisplay
  };
};
