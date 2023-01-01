<script lang="ts">
  export let component: () => Promise<{ default: any }>;
  export let args: any = {};
  $: promise = component();
</script>

{#await promise}
  <slot />
{:then resolvedComponent}
  <svelte:component this={resolvedComponent.default} {...args} />
{:catch}
  <slot name="error" />
{/await}
