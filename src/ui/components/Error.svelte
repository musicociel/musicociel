<script lang="ts">
  import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

  import { extractErrorMessage } from "../errors";
  import FaIcon from "./FaIcon.svelte";

  export let onClose: null | (() => void) = null;
  export let error: any;
  export let type: "alert" | "toast" = "alert";
  let errorMessage = "";

  async function updateErrorMessage(newError: any) {
    const message = await extractErrorMessage(newError);
    if (newError === error) {
      errorMessage = message;
    }
  }

  $: updateErrorMessage(error);
</script>

{#if type == "toast"}
  <div class="toast align-items-center text-white bg-danger border-0 show">
    <div class="d-flex">
      <div class="toast-body">
        <FaIcon icon={faTriangleExclamation} class="me-2" />{errorMessage}
      </div>
      {#if onClose}
        <button type="button" class="btn-close btn-close-white me-2 m-auto" on:click={onClose} />
      {/if}
    </div>
  </div>
{:else}
  <div class="alert alert-danger {$$props.class} {onClose ? 'alert-dismissible' : ''}">
    <FaIcon icon={faTriangleExclamation} class="me-2" />{errorMessage}
    <slot />
    {#if onClose}
      <button type="button" class="btn-close" on:click={onClose} />
    {/if}
  </div>
{/if}
