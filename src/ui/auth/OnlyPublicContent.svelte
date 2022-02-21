<script lang="ts">
  import { _ } from "svelte-i18n";

  import { loginInfo, login } from ".";
</script>

{#if $loginInfo.enabled && !$loginInfo.user}
  <div class="alert alert-info">
    <p>{$_("components.auth.onlyPublicContent")}</p>
    <button type="button" class="btn btn-info" on:click={login}>{$_("commands.login")}</button>
  </div>
{/if}
