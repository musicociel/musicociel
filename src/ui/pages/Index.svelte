<script lang="ts">
  import { isLoading } from "svelte-i18n";
  import LazyRoute from "../router/LazyRoute.svelte";
  import ErrorToasts from "../components/ErrorToasts.svelte";
  import Route from "../router/Route.svelte";
</script>

{#if !$isLoading}
  <LazyRoute path="/" component={() => import("./Home.svelte")} />
  <LazyRoute path="/libraries" component={() => import("./Libraries.svelte")} />
  <Route path="/local-file/:id" redirect={(match) => `${match.url}/content/display`} />
  <Route path="/local-file/:id/content" redirect={(match) => `${match.url}/display`} />
  <LazyRoute prefix={true} path="/local-file/:id/content/:viewer" component={() => import("./LocalFile.svelte")} />
{/if}
<ErrorToasts />
