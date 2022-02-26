<script lang="ts">
  import type { Writable } from "svelte/store";

  export let valueStore: Writable<any>;
</script>

<input {...$$restProps} type="checkbox" bind:checked={$valueStore} indeterminate={$valueStore === null} />
