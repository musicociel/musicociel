<script lang="ts">
  import type { Match } from "./matchPath";
  import { matchPath } from "./matchPath";
  import { locationStore } from "./history";
  import type { To, LocationInfo } from "./locationStore";

  export let component: any = undefined;
  export let args: any = {};
  export let prefix = false;
  export let path: string | string[] = [];
  export let redirect: null | To | ((match: Match, location: LocationInfo) => To) = null;

  function executeRedirect(match: Match | null, redirect: null | To | ((match: Match, location: LocationInfo) => To), location: LocationInfo) {
    if (match && redirect) {
      if (typeof redirect === "function") {
        redirect = redirect(match, location);
      }
      if (redirect) {
        locationStore.navigate(redirect, true);
      }
    }
  }

  let match: Match | null;
  $: match = matchPath($locationStore.pathname, path, prefix);

  $: executeRedirect(match, redirect, $locationStore);
</script>

{#if match}
  <slot {match} location={$locationStore}>
    <svelte:component this={component} {...args} {match} location={$locationStore} />
  </slot>
{/if}
