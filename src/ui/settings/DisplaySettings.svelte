<script lang="ts">
  import { _ } from "svelte-i18n";
  import { faSlidersH, faMinus, faPlus, faEyeSlash, faBackspace } from "@fortawesome/free-solid-svg-icons";
  import { alterationsType, transpose, notesStyle, showChords } from "./settings";
  import Dropdown from "../components/Dropdown.svelte";
  import FaIcon from "../components/FaIcon.svelte";
  import { AlterationsType, NoteStyle } from "../../common/music/chords";

  const switchNoteStyle = (newValue: NoteStyle) => {
    if ($showChords) {
      $notesStyle = $notesStyle === newValue ? NoteStyle.Keep : newValue;
    } else {
      $notesStyle = newValue;
      $showChords = true;
    }
  };

  const switchAlteration = (newValue: AlterationsType) => {
    $alterationsType = newValue;
  };

  const changeTransposition = (inc: number) => {
    if (inc === 0) {
      $transpose = 0;
    } else {
      $transpose += inc;
    }
  };
</script>

<Dropdown class="nav-item" linkClass="btn btn-link nav-link" ulClass="dropdown-menu-end" closeOnClickInside={false}>
  <span slot="button"><FaIcon icon={faSlidersH} /></span>
  <div class="d-flex justify-content-between px-3 py-1 align-items-center">
    <div class="pe-2">{$_("settings.chords")}</div>
    <div class="btn-group">
      <button
        class="btn btn-outline-secondary"
        class:active={!$showChords}
        on:click={() => {
          $showChords = !$showChords;
        }}><FaIcon icon={faEyeSlash} /></button
      >
      <button
        class="btn btn-outline-secondary"
        class:active={$showChords && $notesStyle === NoteStyle.DoReMi}
        on:click={() => switchNoteStyle(NoteStyle.DoReMi)}>Do</button
      >
      <button
        class="btn btn-outline-secondary"
        class:active={$showChords && $notesStyle === NoteStyle.CDE}
        on:click={() => switchNoteStyle(NoteStyle.CDE)}>C</button
      >
    </div>
  </div>
  {#if $showChords}
    <h6 class="dropdown-header">{$_("settings.transpose")}</h6>
    <div class="d-flex justify-content-between px-3 py-1 align-items-center">
      <div class="input-group flex-nowrap">
        <button class="btn btn-outline-secondary" on:click={() => changeTransposition(-1)}><FaIcon icon={faMinus} /></button>
        <input class="form-control form-control-sm" type="number" bind:value={$transpose} />
        {#if $transpose != 0}
          <button class="btn btn-outline-secondary" on:click={() => changeTransposition(0)}><FaIcon icon={faBackspace} /></button>
        {/if}
        <button class="btn btn-outline-secondary" on:click={() => changeTransposition(1)}><FaIcon icon={faPlus} /></button>
      </div>
    </div>
    {#if $transpose != 0}
      <div class="d-flex justify-content-between px-3 py-1 align-items-center">
        <div class="input-group">
          <button
            class="btn btn-outline-secondary"
            class:active={$alterationsType === AlterationsType.Sharp}
            on:click={() => switchAlteration(AlterationsType.Sharp)}>{"\u266F"}</button
          >
          <button
            class="btn btn-outline-secondary"
            class:active={$alterationsType === AlterationsType.Bemol}
            on:click={() => switchAlteration(AlterationsType.Bemol)}>{"\u266D"}</button
          >
        </div>
      </div>
    {/if}
  {/if}
</Dropdown>
