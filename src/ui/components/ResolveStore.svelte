<script lang="ts">
  import type { Readable } from "svelte/store";
  export let store: Readable<any>;
</script>

<slot storeValue={$store} />
