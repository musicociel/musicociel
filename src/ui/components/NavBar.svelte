<script lang="ts">
  import { _ } from "svelte-i18n";
  import LoginInfo from "../auth/LoginInfo.svelte";
  import Link from "../router/Link.svelte";
  import DisplaySettings from "../settings/DisplaySettings.svelte";
  import Logo from "./Logo.svelte";

  export let logoLink = "/";
</script>

<nav class="navbar navbar-expand navbar-light bg-light">
  <div class="container-fluid">
    <Link class="navbar-brand me-auto btn btn-link" href={logoLink}>
      <Logo />
      <slot name="title">
        {$_("app.title")}
      </slot>
    </Link>
    <div class="navbar-nav">
      <slot />
      <DisplaySettings />
      <LoginInfo />
    </div>
  </div>
</nav>
