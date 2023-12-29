<script lang="ts">
  import Link from "../router/Link.svelte";
  import ClickClose from "./ClickClose.svelte";

  export let linkClass = "";
  export let ulClass = "";
  export let open = false;
  export let title = "";
  export let closeOnClickInside = true;

  function clickInside(event: MouseEvent) {
    if (!closeOnClickInside) {
      event.stopPropagation();
    }
  }

  function onClick() {
    open = true;
  }
</script>

<div class="dropdown {$$props.class}">
  <Link class="dropdown-toggle {linkClass} {open ? 'show' : ''}" {title} {onClick}>
    <slot name="button" />
  </Link>
  {#if open}
    <ClickClose bind:open>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="dropdown-menu show {ulClass}" on:click={clickInside}>
        <slot />
      </div>
    </ClickClose>
  {/if}
</div>

<style>
  .dropdown-menu-end {
    right: 0;
  }
</style>
