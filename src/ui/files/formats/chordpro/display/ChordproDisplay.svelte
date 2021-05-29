<script lang="ts">
  import type { Line } from "../../../../../common/files/formats/chordpro/type";
  import { LineType } from "../../../../../common/files/formats/chordpro/type";
  import type { Readable } from "svelte/store";
  import type { OpenFileData } from "../../../types";
  import LineWithChords from "./LineWithChords.svelte";
  import { showChords } from "../../../../settings/settings";

  export let data: Readable<OpenFileData<Line[]>>;
  $: content = $data.content!;
</script>

<div class="p-3">
  {#each content as line}
    {#if line.type === LineType.Directive}
      {#if line.name === "title" || line.name === "t"}
        <h4>{line.args ?? ""}</h4>
      {:else if line.name === "subtitle" || line.name === "st"}
        <h5>{line.args ?? ""}</h5>
      {/if}
    {:else if line.type === LineType.ChordsAndLyrics}
      {#if $showChords}
        <LineWithChords {line} />
      {:else}
        <div>
          {#each line.content as { lyrics }}{lyrics || ""}{/each}
        </div>
      {/if}
    {:else if line.type === LineType.EmptyLine}
      <br />
    {/if}
  {/each}
</div>
