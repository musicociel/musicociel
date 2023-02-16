<script lang="ts">
  import { faUser } from "@fortawesome/free-solid-svg-icons";

  import { _ } from "svelte-i18n";
  import Dropdown from "../components/Dropdown.svelte";
  import FaIcon from "../components/FaIcon.svelte";
  import { loginInfo, logout, login } from "./index";

  $: user = $loginInfo.user;
  $: name = user?.preferred_username ?? user?.name ?? user?.given_name ?? user?.nickname;
</script>

{#if $loginInfo.enabled}
  {#if user}
    <Dropdown class="nav-item" linkClass="nav-link" ulClass="dropdown-menu-end" title={$_("commands.loggedInMenu")}>
      <span slot="button"><FaIcon icon={faUser} /></span>
      <h6 class="dropdown-header">{name}</h6>
      <button class="dropdown-item btn btn-link" on:click={logout}>{$_("commands.logout")}</button>
    </Dropdown>
  {:else}
    <div class="nav-item">
      <button class="btn btn-link nav-link" on:click={login} title={$_("commands.login")}><FaIcon icon={faUser} /></button>
    </div>{/if}
{/if}
