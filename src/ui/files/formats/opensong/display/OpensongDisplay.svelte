<script lang="ts">
  import { LineType } from "../../../../../common/files/formats/opensong/type";
  import type { Song } from "../../../../../common/files/formats/opensong/type";
  import { getStructure, expand } from "../../../../../common/files/formats/opensong/util";
  import { removeControlChars } from "../../../../../common/files/formats/opensong/parse";
  import LineWithChords from "./LineWithChords.svelte";
  import VerseNumber from "./VerseNumber.svelte";
  import Section from "./Section.svelte";
  import Comment from "./Comment.svelte";
  import { groupLyrics } from "./groupLyrics";
  import type { Readable } from "svelte/store";
  import type { OpenFileData } from "../../../types";
  import { showChords } from "../../../../settings/settings";
  import Paginator from "../../../../paginator/Paginator.svelte";
  import PaginatorItem from "../../../../paginator/PaginatorItem.svelte";
  import { paginateFactory } from "../../../../paginator/paginate";

  export let data: Readable<OpenFileData<Song>>;

  const paginate = paginateFactory();

  $: content = $data.content!;
  $: structure = getStructure(content.lyrics);
  $: lyrics = (!$showChords || !structure.hasChords) && structure.hasCompactedVerses ? expand(content.lyrics) : content.lyrics;
  $: groupedLyrics = groupLyrics(lyrics);
</script>

<Paginator items={groupedLyrics} {paginate} {content} class={$$props.class}>
  {#if content.title}
    <PaginatorItem>
      <strong>{content.title}</strong>
    </PaginatorItem>
  {/if}
  {#if content.author}
    <PaginatorItem>
      <small>{content.author}</small>
    </PaginatorItem>
  {/if}
  {#each groupedLyrics as item}
    <PaginatorItem>
      {#each item.lines as line}
        {#if line.type === LineType.ChordsAndLyrics}
          {#if $showChords && line.chords}
            <LineWithChords {line} />
          {:else}
            {#each line.lyrics || [] as lyricsLine}
              <div>
                {#if lyricsLine.verse}
                  <VerseNumber verse={lyricsLine.verse} />
                {/if}
                {#each lyricsLine.parts as part}{removeControlChars(part)}{/each}
              </div>
            {/each}
          {/if}
        {:else if line.type === LineType.SectionHeader}
          <Section name={line.name} />
        {:else if line.type === LineType.Comment}
          <Comment>{removeControlChars(line.content)}</Comment>
        {/if}
      {/each}
    </PaginatorItem>
  {/each}
  {#if content.copyright}
    <PaginatorItem>
      <small class="text-muted">&copy; {content.copyright}</small>
    </PaginatorItem>
  {/if}
  <div slot="slide" let:index let:count class="position-absolute bottom-0 end-0 badge rounded-pill bg-secondary fw-bold m-2 p-2">
    {index + 1} / {count}
  </div>
</Paginator>
