<script lang="ts">
  import { _ } from "svelte-i18n";
  import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
  import { Permissions } from "../../../common/storage/permissions";
  import ActionButton from "../../components/ActionButton.svelte";
  import FaIcon from "../../components/FaIcon.svelte";
  import type { Library } from "../libraries";
  import { deleteLibrary } from "./deleteLibrary";

  export let library: Library;

  const confirmAndDeleteLibrary = async () => {
    if (confirm($_("components.libraries.confirmDeleteLibrary", { values: { library: library.library } }))) {
      await deleteLibrary(library);
    }
  };
</script>

{#if library.permissions & Permissions.WritePermissions}
  <ActionButton class="btn btn-danger" onClick={confirmAndDeleteLibrary} compact><FaIcon icon={faTrashCan} /></ActionButton>
{/if}
