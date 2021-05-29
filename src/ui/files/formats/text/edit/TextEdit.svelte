<script lang="ts">
  import type { Ace } from "ace-builds";
  import type { Readable } from "svelte/store";
  import AceEditor from "../../../../components/AceEditor.svelte";

  export let data: Readable<{ session: Ace.EditSession }>;
</script>

<AceEditor class="h-100 w-100" session={$data.session} />
