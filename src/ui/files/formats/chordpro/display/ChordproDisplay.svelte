<script lang="ts">
  import type { Line } from "../../../../../common/files/formats/chordpro/type";
  import { LineType } from "../../../../../common/files/formats/chordpro/type";
  import type { Readable } from "svelte/store";
  import type { OpenFileData } from "../../../types";
  import LineWithChords from "./LineWithChords.svelte";
  import { showChords } from "../../../../settings/settings";
  import Paginator from "../../../../paginator/Paginator.svelte";
  import { paginateFactory } from "../../../../paginator/paginate";
  import PaginatorItem from "../../../../paginator/PaginatorItem.svelte";

  const paginate = paginateFactory();

  export let data: Readable<OpenFileData<Line[]>>;
  $: content = $data.content!;
</script>

<Paginator {paginate} {content} class={$$props.class}>
  {#each content as line}
    <PaginatorItem>
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
    </PaginatorItem>
  {/each}
  <div slot="slide" let:index let:count class="position-absolute bottom-0 end-0 badge rounded-pill bg-secondary fw-bold m-2 p-2">
    {index + 1} / {count}
  </div>
</Paginator>
