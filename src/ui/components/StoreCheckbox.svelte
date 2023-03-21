<script lang="ts">
  import type { WritableSignal } from "@amadeus-it-group/tansu";

  export let valueStore: WritableSignal<any>;
</script>

<input {...$$restProps} type="checkbox" bind:checked={$valueStore} indeterminate={$valueStore === null} />
