<script lang="ts">
  import { closeError, errors } from "../errors";
  import Error from "./Error.svelte";
</script>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
  {#each $errors as error (error)}
    <Error type="toast" {error} onClose={() => closeError(error)} />
  {/each}
</div>
