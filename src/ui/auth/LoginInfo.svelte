<script lang="ts">
  import { faUser } from "@fortawesome/free-solid-svg-icons";

  import { _ } from "svelte-i18n";
  import Dropdown from "../components/Dropdown.svelte";
  import FaIcon from "../components/FaIcon.svelte";
  import { loginInfo, manageAccount, logout, login } from "./index";

  $: user = $loginInfo.user;
</script>

{#if $loginInfo.enabled}
  {#if user}
    <Dropdown class="nav-item" linkClass="nav-link" ulClass="dropdown-menu-end">
      <span slot="button"><FaIcon icon={faUser} /></span>
      <h6 class="dropdown-header">{user.preferred_username}</h6>
      <button class="dropdown-item btn btn-link" on:click={manageAccount}>{$_("commands.manageAccount")}</button>
      <button class="dropdown-item btn btn-link" on:click={logout}>{$_("commands.logout")}</button>
    </Dropdown>
  {:else}
    <div class="nav-item">
      <button class="btn btn-link nav-link" on:click={login} title={$_("commands.login")}><FaIcon icon={faUser} /></button>
    </div>{/if}
{/if}
