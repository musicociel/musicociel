<script lang="ts">
  import { _ } from "svelte-i18n";
  import Error from "./Error.svelte";

  export let onSubmit: () => void | Promise<void>;

  let loading = false;
  let error: any = null;

  export const submit = async () => {
    try {
      loading = true;
      error = null;
      await onSubmit();
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  };
</script>

<form class="position-relative {$$props.class}" on:submit|preventDefault={submit}>
  {#if error}
    <Error {error} onClose={() => (error = null)}>
      <br />
      <button class="btn btn-danger mt-3" type="submit">{$_("commands.retry")}</button>
    </Error>
  {/if}
  <slot />
  {#if loading}
    <div class="position-absolute top-0 start-0 bottom-0 end-0 opacity-75 bg-white bg-gradient border">
      <div class="position-absolute top-50 start-50 translate-middle">
        <span class="spinner-border spinner-border me-1" />
      </div>
    </div>
  {/if}
</form>
