<script lang="ts">
  import { processChords } from "../../common/music/chords";
  import { transpose, notesStyle, alterationsType } from "./settings";

  export let chord: string;

  $: displayChord = processChords(chord, $transpose, $notesStyle, $alterationsType, true);
</script>

<span class="chord">{displayChord}</span>

<style>
  .chord {
    font-weight: bold;
    color: #31708f;
  }
</style>
