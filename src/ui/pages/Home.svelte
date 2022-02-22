<script lang="ts">
  import { _ } from "svelte-i18n";
  import { faFolderOpen, faTimes } from "@fortawesome/free-solid-svg-icons";
  import FaIcon from "../components/FaIcon.svelte";
  import ResolveStore from "../components/ResolveStore.svelte";
  import Link from "../router/Link.svelte";
  import { openedFilesList } from "../files/filesystem/openFiles";
  import NavBar from "../components/NavBar.svelte";
  import { hasLibraries } from "../libraries/hasLibraries";

  async function openFile() {
    const { openFilesPicker } = await import("../files/filesystem/filesPicker");
    await openFilesPicker();
  }
</script>

<NavBar />
<div class="container py-3">
  <h2>{$_("app.title")}</h2>
  <p>{$_("pages.home.description")}</p>
  <button class="btn btn-primary" on:click={openFile}
    ><FaIcon class="mr-1" icon={faFolderOpen} />
    {$_("commands.openFile")}</button
  >
  {#if $hasLibraries}
    <Link class="btn btn-secondary" href="/libraries">{$_("pages.libraries.title")}</Link>
  {/if}
  <div class="list-group mt-3">
    {#each Object.keys($openedFilesList) as id}
      <ResolveStore store={$openedFilesList[id]} let:storeValue={file}>
        <Link class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" href="/local-file/{id}">
          <span class="mr-3">{file.file?.name || ""}</span>
          <div class="btn-group">
            <button class="btn btn-outline-secondary btn-sm" on:click|stopPropagation|preventDefault={$openedFilesList[id].close}
              ><FaIcon icon={faTimes} /></button
            >
          </div>
        </Link>
      </ResolveStore>
    {/each}
  </div>
</div>
