<script lang="ts">
  import { _ } from "svelte-i18n";
  import NavBar from "../components/NavBar.svelte";
  import LibrariesList from "../libraries/LibrariesList.svelte";
</script>

<NavBar />
<div class="container py-3">
  <h2>{$_("pages.libraries.title")}</h2>
  <LibrariesList />
</div>
