<script lang="ts">
  import { isLoading } from "svelte-i18n";
  import LazyRoute from "../router/LazyRoute.svelte";
  import ErrorToasts from "../components/ErrorToasts.svelte";
</script>

{#if !$isLoading}
  <LazyRoute path="/" component={() => import("./Home.svelte")} />
  <LazyRoute path="/libraries" component={() => import("./Libraries.svelte")} />
  <LazyRoute path="/local-file/:id/:viewer?" component={() => import("./LocalFile.svelte")} />
{/if}
<ErrorToasts />
