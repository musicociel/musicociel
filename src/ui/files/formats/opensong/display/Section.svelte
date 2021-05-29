<script>
  const TYPES = {
    C: "Chorus",
    B: "Bridge",
    V: "Verse",
    T: "Tag",
    P: "Pre-Chorus"
  };

  function transformName(name) {
    const firstLetter = name[0];
    const typeLabel = TYPES[firstLetter];
    return typeLabel ? `${typeLabel} ${name.substring(1)}` : name;
  }

  export let name;

  $: title = transformName(name);
</script>

<div>
  <span class="section">{title}</span>
</div>

<style>
  .section {
    border: 1px solid darkred;
    color: darkred;
    font-size: smaller;
    font-weight: bold;
    border-radius: 2px;
    padding: 2px 5px;
    margin: 3px 0px;
    white-space: nowrap;
  }
</style>
