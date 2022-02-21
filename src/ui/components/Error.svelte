<script lang="ts">
  import { extractErrorMessage } from "../errors";

  export let onClose: null | (() => void) = null;
  export let error: any;
  let errorMessage = "";

  $: extractErrorMessage(error).then((msg) => (errorMessage = msg));
</script>

<div class="alert alert-danger {$$props.class} {onClose ? 'alert-dismissible' : ''}">
  {errorMessage}
  <slot />
  {#if onClose}
    <button type="button" class="btn-close" on:click={onClose} />
  {/if}
</div>
