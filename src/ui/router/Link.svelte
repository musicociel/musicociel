<script type="ts">
  import { locationStore } from "./history";
  import type { To } from "./locationStore";

  export let href: undefined | To = undefined;
  export let onClick: undefined | ((event: MouseEvent) => void) = undefined;

  $: computedHref = href ? locationStore.createHref(href) : "javascript:void(0);";
</script>

<a class={$$props.class} href={computedHref} on:click|preventDefault={onClick || (() => (href ? locationStore.navigate(href) : null))}>
  <slot />
</a>
