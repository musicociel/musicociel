<div class="item">
  <slot />
</div>

<style>
  .item {
    display: inline-block;
    position: absolute;
    left: -10000px;
    top: -10000px;
    transform-origin: top left;
    transform: translate(0px, 0px);
  }
</style>
