<script lang="ts">
  import Link from "../router/Link.svelte";
  import type { Match } from "../router/matchPath";
  import { locationStore } from "../router/history";
  import { openedFilesList } from "../files/filesystem/openFiles";
  import FaIcon from "../components/FaIcon.svelte";
  import { faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
  import NavBar from "../components/NavBar.svelte";
  import Error from "../components/Error.svelte";

  export let match: Match;

  $: file = $openedFilesList[match.params.id];
  $: hasFile = !!file;
  $: if (!file) {
    locationStore.navigate("/", true);
  }
  $: viewer = file ? file.getViewer(match.params.viewer) : null;
  $: if (hasFile && !viewer && match.params.viewer !== "display") {
    locationStore.navigate(`/local-file/${match.params.id}/content/display`, true);
  }
</script>

<div class="d-flex flex-column h-100">
  <NavBar>
    <div class="nav-item">
      <button class="btn btn-link nav-link" on:click|stopPropagation|preventDefault={file.close}><FaIcon icon={faTimes} /></button>
    </div>
    <div class="nav-item">
      <Link class="btn btn-link nav-link" href="/local-file/{match.params.id}/content/edit"><FaIcon icon={faEdit} /></Link>
    </div>
  </NavBar>
  {#if hasFile && $file.error}
    <div class="container-fluid p-3"><Error error={$file.error} /></div>
  {:else if viewer && $viewer?.error}
    <div class="container-fluid p-3"><Error error={$viewer.error} /></div>
  {:else if viewer && $viewer?.component}
    <svelte:component this={$viewer.component} data={$viewer.data} class="flex-grow-1" />
  {/if}
</div>
