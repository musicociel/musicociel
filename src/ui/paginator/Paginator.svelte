<script lang="ts">
  import { afterUpdate, tick } from "svelte";
  import Swiper from "./Swiper.svelte";
  import type { ItemToPaginate, Size } from "./type";

  // input-only properties:
  export let paginate: (items: ItemToPaginate[], { width, height }: Size) => void = () => {};
  export let content: any = null;

  // input/output properties:
  export let currentSlide: any = undefined;

  // output-only properties:
  export let slidesCount = 1;
  export let paginatedItems: any[] = [];

  let swiper: Swiper;

  let width = 0;
  let height = 0;

  let lastUpdateWidth = 0;
  let lastUpdateHeight = 0;
  let lastUpdateContent = null;

  let slidesArray = [0];
  let itemsContainer: HTMLDivElement;

  const itemsToPaginate: ItemToPaginate[] = [];

  const setSlidesNumber = async (newValue: number) => {
    if (newValue != slidesCount) {
      const newSlides: number[] = [];
      for (let i = 0; i < newValue; i++) {
        newSlides.push(i);
      }
      slidesArray = newSlides;
      slidesCount = newValue;
    }
    await tick(); // wait for the slides to be in the DOM
    if (swiper) {
      swiper.updateSlides();
    }
  };

  export function update() {
    if (!itemsContainer || !width || !height) {
      return;
    }
    lastUpdateWidth = width;
    lastUpdateHeight = height;
    lastUpdateContent = content;
    const domItems = itemsContainer.querySelectorAll<HTMLDivElement>(":scope > div.item");
    let i = 0;
    for (const curDomItem of domItems) {
      const width = curDomItem.offsetWidth;
      const height = curDomItem.offsetHeight;
      let currentItemToPaginate = itemsToPaginate[i];
      if (!currentItemToPaginate) {
        currentItemToPaginate = itemsToPaginate[i] = {} as ItemToPaginate;
      }
      currentItemToPaginate.dom = curDomItem;
      currentItemToPaginate.width = width;
      currentItemToPaginate.height = height;
      currentItemToPaginate.slide = i;
      currentItemToPaginate.left = (lastUpdateWidth - width) / 2;
      currentItemToPaginate.top = (lastUpdateHeight - height) / 2;
      currentItemToPaginate.scale = 1;
      i++;
    }
    itemsToPaginate.length = i;
    paginate(itemsToPaginate, { width, height });
    let maxSlideNumber = 0;
    for (const curItem of itemsToPaginate) {
      const slide = curItem.slide;
      if (slide > maxSlideNumber) {
        maxSlideNumber = slide;
      } else if (slide < 0) {
        curItem.scale = 0;
        curItem.left = 0;
        curItem.top = 0;
      }
      curItem.dom.style.transform = `translate(${10000 + slide * width + curItem.left}px,${10000 + curItem.top}px) scale(${curItem.scale})`;
    }
    paginatedItems = itemsToPaginate;
    setSlidesNumber(maxSlideNumber + 1);
  }

  afterUpdate(async () => {
    if (lastUpdateWidth !== width || lastUpdateHeight !== height || !lastUpdateContent || lastUpdateContent !== content) {
      update();
    }
  });
</script>

<div bind:offsetWidth={width} bind:offsetHeight={height} class="position-relative overflow-hidden {$$props.class ?? ''}">
  <Swiper {width} {height} bind:currentSlide bind:this={swiper} class="position-absolute top-0 start-0">
    <div bind:this={itemsContainer} class="position-absolute top-0 start-0 w-100 h-100">
      <slot />
    </div>
    {#each slidesArray as slide}
      <div class="swiper-slide">
        <slot name="slide" index={slide} count={slidesArray.length} />
      </div>
    {/each}
  </Swiper>
</div>

<style>
  .swiper-slide {
    pointer-events: none;
  }
</style>
