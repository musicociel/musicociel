<script>
  import { removeControlChars } from "../../../../../common/files/formats/opensong/parse";
  import VerseNumber from "./VerseNumber.svelte";
  import Chord from "../../../../settings/Chord.svelte";

  export let line;
</script>

<table>
  <tr>
    <td />
    {#each line.chords as { chord }}
      <td>
        {#if chord}
          <Chord {chord} />
          &nbsp;
        {/if}
      </td>
    {/each}
  </tr>
  {#each line.lyrics || [] as lyricsLine}
    <tr>
      {#if lyricsLine.verse}
        <td class="lyrics">
          <VerseNumber verse={lyricsLine.verse} />
        </td>
      {:else}
        <td class="align-cell" />
      {/if}
      {#each lyricsLine.parts as part}
        <td class="lyrics">{removeControlChars(part)}</td>
      {/each}
    </tr>
  {/each}
</table>

<style>
  table {
    line-height: normal;
  }
  td {
    white-space: nowrap;
    padding: 0;
  }
  td.lyrics {
    white-space: pre;
  }
</style>
