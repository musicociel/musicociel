import { derived } from "svelte/store";
import type { ViewerInterface } from "../../../types";
import Ace from "ace-builds";
import TextEdit from "./TextEdit.svelte";
import { onAbort } from "../../../../../common/closeFunction";
import produce from "immer";

const { Document }: { Document: { new (content: string): Ace.Ace.Document } } = Ace.require("ace/document");
const { Mode }: { Mode: { new (): Ace.Ace.SyntaxMode } } = Ace.require("ace/mode/text");

export default (content: ViewerInterface<string>) => {
  const document: Ace.Ace.Document = new Document("");
  document.on("change", () => {
    content.update(
      produce((value) => {
        value.content = document.getValue();
      })
    );
  });
  const session = Ace.createEditSession(document, new Mode());
  onAbort(content.close.signal, () => session.destroy());
  return {
    data: derived(content, ({ content }) => {
      const newContent = content ?? "";
      if (document.getValue() !== newContent) {
        document.setValue(content ?? "");
      }
      return { session };
    }),
    component: TextEdit
  };
};
