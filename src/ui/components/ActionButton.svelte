<script lang="ts">
  import { extractErrorMessage } from "../errors";

  export let disabled = false;
  export let onClick: () => void | Promise<void>;
  export let compact = false;

  let running = false;
  let error: any = null;
  // TODO: improve the display of the error message
  let errorMessage = "";
  $: extractErrorMessage(error).then((msg) => (errorMessage = msg));

  export const click = async () => {
    try {
      running = true;
      error = null;
      await onClick();
    } catch (e) {
      error = e;
    } finally {
      running = false;
    }
  };
</script>

<button type="button" disabled={running || disabled} class={$$props.class} on:click={click} title={errorMessage}>
  {#if running}<span class="spinner-border spinner-border-sm me-1" />{/if}
  {#if !running || !compact}
    <slot />
  {/if}
</button>
