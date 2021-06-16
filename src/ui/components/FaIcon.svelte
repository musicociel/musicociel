<script lang="ts">
  import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
  export let icon: IconDefinition;

  let boxWidth: number, boxHeight: number, path: any;

  $: ({
    icon: [boxWidth, boxHeight, , , path]
  } = icon);
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {boxWidth} {boxHeight}" class="icon {$$props.class || ''}">
  <path d={path} />
</svg>

<style>
  svg.icon {
    height: 1em;
  }

  path {
    fill: currentColor;
  }
</style>
