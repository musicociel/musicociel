<script lang="ts">
  import { onMount } from "svelte";
  export let open = true;
  let ghostClick = true;
  function close() {
    if (!ghostClick) {
      open = false;
    }
  }
  onMount(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    ghostClick = false;
  });
</script>

<svelte:window on:click={close} />
<slot />
