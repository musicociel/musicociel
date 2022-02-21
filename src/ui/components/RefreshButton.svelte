<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { RefreshablePromiseValue } from "../promiseStore";

  export let type = "btn-secondary";
  export let content: RefreshablePromiseValue<any>;
</script>

<button type="button" class="btn {type} {$$props.class}" on:click={content.refresh} disabled={$content.loading}>
  {#if $content.loading}
    <span class="spinner-border spinner-border-sm me-1" />
  {/if}
  <slot>
    {$_("commands.refresh")}
  </slot>
</button>
