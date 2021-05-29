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

  export let data: Readable<OpenFileData<Song>>;

  $: content = $data.content!;
  $: structure = getStructure(content.lyrics);
  $: lyrics = (!$showChords || !structure.hasChords) && structure.hasCompactedVerses ? expand(content.lyrics) : content.lyrics;
  $: groupedLyrics = groupLyrics(lyrics);
</script>

<div class="p-3">
  {#if content.title}
    <div>
      <strong>{content.title}</strong>
    </div>
  {/if}
  {#if content.author}
    <div>
      <small>{content.author}</small>
    </div>
  {/if}
  {#each groupedLyrics as item}
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
  {/each}
  {#if content.copyright}
    <div class="text-muted mx-2">
      <small>&copy; {content.copyright}</small>
    </div>
  {/if}
</div>
