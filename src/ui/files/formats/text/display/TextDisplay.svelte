<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { OpenFileData } from "../../../types";

  export let data: Readable<OpenFileData<string>>;
</script>

<div style="white-space: pre;">
  {$data.content}
</div>
