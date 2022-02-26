<script lang="ts">
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import FaIcon from "../components/FaIcon.svelte";
  import ResolveStore from "../components/ResolveStore.svelte";
  import { openedFilesList } from "./filesystem/openFiles";
  import Link from "../router/Link.svelte";
  import StoreCheckbox from "../components/StoreCheckbox.svelte";
  import { allBooleansStore, countTrueStore } from "../booleanStores";
  import { derived, get } from "svelte/store";
  import { _ } from "svelte-i18n";

  const selectedStores = derived(openedFilesList, (item) => Object.keys(item).map((key) => item[key].selected));
  const allSelected = allBooleansStore(selectedStores);
  const numberSelected = countTrueStore(selectedStores);

  function closeSelected() {
    for (const key of openedFilesListKeys) {
      const item = $openedFilesList[key];
      if (get(item.selected)) {
        item.close();
      }
    }
  }

  $: openedFilesListKeys = Object.keys($openedFilesList);
</script>

<div class="list-group mt-3">
  {#if openedFilesListKeys.length > 0}
    <div class="list-group-item d-flex bg-light bg-gradient">
      <StoreCheckbox class="form-check-input me-3" valueStore={allSelected} />
      <span class="me-auto fw-bold">{$_("components.openfiles.numSelectedFiles", { values: { num: $numberSelected } })}</span>
      <div class="btn-group">
        <button disabled={$numberSelected === 0} class="btn btn-outline-secondary btn-sm" on:click={closeSelected}><FaIcon icon={faTimes} /></button>
      </div>
    </div>
  {/if}
  {#each openedFilesListKeys as id}
    <ResolveStore store={$openedFilesList[id]} let:storeValue={file}>
      <div class="list-group-item list-group-item-action d-flex">
        <StoreCheckbox class="form-check-input me-3" valueStore={$openedFilesList[id].selected} />
        <Link class="me-auto" href="/local-file/{id}">{file.file?.name || ""}</Link>
        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" on:click={$openedFilesList[id].close}><FaIcon icon={faTimes} /></button>
        </div>
      </div>
    </ResolveStore>
  {/each}
</div>
