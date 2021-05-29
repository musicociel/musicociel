<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Ace from "ace-builds";
  import "ace-builds/src-noconflict/theme-chrome";

  let div: HTMLDivElement;
  let editor: Ace.Ace.Editor;
  export let session: undefined | Ace.Ace.EditSession;

  export const getEditor = () => editor;

  onMount(() => {
    editor = Ace.edit(div, {
      session
    });
  });

  $: updateSession(session);
  const updateSession = (newValue: Ace.Ace.EditSession | undefined) => {
    if (editor) {
      editor.setSession(newValue as any);
    }
  };

  onDestroy(() => {
    if (editor) {
      // if a session was passed explicitly,
      // prevent it from being destroyed
      if (editor.session === session) {
        editor.setSession(undefined as any);
      }
      editor.destroy();
    }
  });
</script>

<div class={$$props.class} bind:this={div} />
