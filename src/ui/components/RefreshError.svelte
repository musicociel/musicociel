<script lang="ts">
  import { _ } from "svelte-i18n";
  import Error from "./Error.svelte";
  import type { RefreshablePromiseValue } from "../promiseStore";
  import RefreshButton from "./RefreshButton.svelte";

  export let content: RefreshablePromiseValue<any>;
</script>

{#if $content.hasError}
  <Error error={$content.error}>
    <br />
    <RefreshButton class="mt-3" {content} type="btn-danger">
      {$_("commands.retry")}
    </RefreshButton>
  </Error>
{:else}
  <RefreshButton {content} />
{/if}
