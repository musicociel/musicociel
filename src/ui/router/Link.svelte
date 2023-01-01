<script lang="ts">
  import { locationStore } from "./history";
  import type { To } from "./locationStore";

  export let href: undefined | To = undefined;
  export let onClick: undefined | ((event: MouseEvent) => void) = undefined;
  export let disabled = false;

  $: computedHref = href && !disabled ? locationStore.createHref(href) : "javascript:void(0);";
</script>

<a
  class="{$$props.class} {disabled ? 'disabled' : ''}"
  href={computedHref}
  on:click|preventDefault={onClick || (() => (href && !disabled ? locationStore.navigate(href) : null))}
>
  <slot />
</a>
