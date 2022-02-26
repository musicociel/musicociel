<script lang="ts">
  import { _ } from "svelte-i18n";
  import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
  import FaIcon from "../components/FaIcon.svelte";

  import Link from "../router/Link.svelte";

  import NavBar from "../components/NavBar.svelte";
  import { hasLibraries } from "../libraries/hasLibraries";
  import OpenFiles from "../files/OpenFiles.svelte";

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
    ><FaIcon class="me-1" icon={faFolderOpen} />
    {$_("commands.openFile")}</button
  >
  {#if $hasLibraries}
    <Link class="btn btn-secondary" href="/libraries">{$_("pages.libraries.title")}</Link>
  {/if}
  <OpenFiles />
</div>
