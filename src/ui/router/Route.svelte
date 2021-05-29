<script type="ts">
  import { matchPath } from "./matchPath";
  import { locationStore } from "./history";

  export let component: any;
  export let args: any;
  export let prefix: boolean = false;
  export let path: string | string[] = [];

  $: match = matchPath($locationStore.pathname, path, prefix);
</script>

{#if match}
  <slot {match} location={$locationStore}>
    <svelte:component this={component} {...args} {match} location={$locationStore} />
  </slot>
{/if}
