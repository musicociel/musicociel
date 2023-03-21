<script lang="ts">
  import type { ReadableSignal } from "@amadeus-it-group/tansu";
  export let store: ReadableSignal<any>;
</script>

<slot storeValue={$store} />
