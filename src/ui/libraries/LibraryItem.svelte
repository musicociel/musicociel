<script lang="ts">
  import LibraryDeleteButton from "./deleteLibrary/DeleteLibraryButton.svelte";
  import type { Library } from "./libraries";

  export let library: Library;
</script>

<div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
  <span>{library.library}</span>
  <LibraryDeleteButton {library} />
</div>
