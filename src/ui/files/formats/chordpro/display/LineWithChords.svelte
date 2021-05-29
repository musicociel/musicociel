<script lang="ts">
  import type { ChordsAndLyrics } from "../../../../../common/files/formats/chordpro/type";
  import Chord from "../../../../settings/Chord.svelte";

  export let line: ChordsAndLyrics;
</script>

<table>
  <tr>
    {#each line.content as { chord }}
      <td>
        {#if chord}
          <Chord {chord} />
          &nbsp;
        {/if}
      </td>
    {/each}
  </tr>
  <tr>
    {#each line.content as { lyrics }}
      <td class="lyrics">{lyrics || ""}</td>
    {/each}
  </tr>
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
