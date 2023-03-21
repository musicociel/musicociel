<script lang="ts">
  import type { Ace } from "ace-builds";
  import type { ReadableSignal } from "@amadeus-it-group/tansu";
  import AceEditor from "../../../../components/AceEditor.svelte";

  export let data: ReadableSignal<{ session: Ace.EditSession }>;
</script>

<AceEditor class="h-100 w-100" session={$data.session} />
