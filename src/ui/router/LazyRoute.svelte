<script type="ts">
  import Route from "./Route.svelte";
  import Lazy from "./Lazy.svelte";
  export let component: any;
  export let args: any;
  export let prefix: boolean;
  export let path: string;
</script>

<Route {path} {prefix} let:location let:match>
  <Lazy {component} args={{ ...args, location, match }} />
</Route>
