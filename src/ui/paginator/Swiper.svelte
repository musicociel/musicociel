<script lang="ts">
  import Swiper from "swiper";
  import "swiper/css";
  import { onDestroy } from "svelte";

  export let width = 0;
  export let height = 0;
  export let currentSlide = 0;

  let swiper: Swiper | null = null;
  let container: HTMLElement | null = null;

  export function updateSlides() {
    if (swiper) {
      swiper.updateSlides();
    }
  }

  function updateSize(width: number, height: number, container: HTMLElement | null) {
    if (!container) {
      return;
    }
    if (width > 0 && height > 0 && !swiper) {
      swiper = new Swiper(container, {
        touchEventsTarget: "container",
        initialSlide: currentSlide,
        resizeObserver: false,
        updateOnImagesReady: false,
        updateOnWindowResize: false,
        width,
        height
      });
      swiper.on("slideChange", () => {
        currentSlide = swiper!.activeIndex;
      });
    } else if (swiper) {
      swiper.params.width = width;
      swiper.params.height = height;
      swiper.update();
    }
  }

  $: updateSize(width, height, container);

  onDestroy(() => {
    if (swiper) {
      swiper.destroy();
      swiper = null;
    }
  });
</script>

<div bind:this={container} style="width:{width}px;height:{height}px;{$$props.style ?? ''}" class="swiper {$$props.class ?? ''}">
  <div class="swiper-wrapper">
    <slot />
  </div>
</div>

<style>
  .swiper {
    overflow: hidden;
    z-index: 0;
  }
</style>
