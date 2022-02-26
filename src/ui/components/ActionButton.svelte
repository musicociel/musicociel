<script lang="ts">
  import { notifyError } from "../errors";

  export let disabled = false;
  export let onClick: () => void | Promise<void>;
  export let compact = false;

  let running = false;

  export const click = async () => {
    try {
      running = true;
      await onClick();
    } catch (e) {
      notifyError(e);
    } finally {
      running = false;
    }
  };
</script>

<button type="button" disabled={running || disabled} class={$$props.class} on:click={click}>
  {#if running}<span class="spinner-border spinner-border-sm me-1" />{/if}
  {#if !running || !compact}
    <slot />
  {/if}
</button>
