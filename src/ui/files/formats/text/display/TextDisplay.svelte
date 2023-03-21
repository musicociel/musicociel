<script lang="ts">
  import type { ReadableSignal } from "@amadeus-it-group/tansu";
  import type { OpenFileData } from "../../../types";

  export let data: ReadableSignal<OpenFileData<string>>;
</script>

<div style="white-space: pre;">
  {$data.content}
</div>
