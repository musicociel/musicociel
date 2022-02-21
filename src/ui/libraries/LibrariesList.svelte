<script lang="ts">
  import RefreshError from "../components/RefreshError.svelte";
  import { Permissions } from "../../common/storage/permissions";
  import OnlyPublicContent from "../auth/OnlyPublicContent.svelte";
  import { loginInfo } from "../auth";
  import LibraryItem from "./LibraryItem.svelte";
  import { filterLibraries, libraries } from "./libraries";
  import Lazy from "../router/Lazy.svelte";
  import { _ } from "svelte-i18n";

  export let expectedPermissions: Permissions = Permissions.None;

  $: filteredLibraries = filterLibraries($libraries.value, expectedPermissions);

  let addingLibrary = false;
  const newLibraryArgs = {
    onClose() {
      addingLibrary = false;
    }
  };
</script>

<OnlyPublicContent />
<div class="list-group my-3">
  {#each filteredLibraries as library (library.library)}
    <slot {library}>
      <LibraryItem {library} />
    </slot>
  {:else}
    {#if !$libraries.loading}
      <p>{$_("components.libraries.foundNoLibrary")}</p>
    {/if}
  {/each}
</div>
<RefreshError content={libraries} />
{#if $loginInfo.user}
  {#if addingLibrary}
    <Lazy component={() => import("./createLibrary/CreateLibraryForm.svelte")} args={newLibraryArgs} />
  {:else}
    <button class="btn btn-secondary" on:click={() => (addingLibrary = true)}>{$_("components.libraries.addLibrary")}</button>
  {/if}
{/if}
