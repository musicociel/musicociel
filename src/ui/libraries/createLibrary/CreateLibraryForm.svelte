<script lang="ts">
  import { faClose, faPlus } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import FaIcon from "../../components/FaIcon.svelte";
  import Form from "../../components/Form.svelte";
  import { createLibrary } from "./createLibrary";

  const libraryNameId = "libraryName";

  export let onClose = () => {};

  onMount(() => {
    document.getElementById(libraryNameId)?.focus();
  });

  let libraryName = "";

  const onSubmit = async () => {
    await createLibrary(libraryName);
    onClose();
  };
</script>

<Form class="row py-3" {onSubmit}>
  <label for={libraryNameId} class="col-auto col-form-label">{$_("components.libraries.libraryName")}</label>
  <div class="col-12 col-sm-auto">
    <input type="text" class="form-control" id={libraryNameId} bind:value={libraryName} autocomplete="off" />
  </div>
  <div class="col-auto mt-3 mt-sm-0">
    <button type="submit" class="btn btn-outline-primary"><FaIcon icon={faPlus} /></button>
    <button type="button" class="btn btn-outline-secondary" on:click={onClose}><FaIcon icon={faClose} /></button>
  </div>
</Form>
