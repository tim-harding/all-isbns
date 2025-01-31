<script setup lang="ts">
import { useUiStore } from "@/stores/uiStore";

const ui = useUiStore();
</script>

<template>
  <button
    :class="s.sidebarToggle"
    @mousedown="ui.isSidebarOpen = !ui.isSidebarOpen"
  >
    <span class="sr">Toggle sidebar</span>
    <div
      :class="{
        [s.icon]: true,
        [s.iconClose]: ui.isSidebarOpen,
      }"
    >
      <div v-for="_ in 3" :class="s.iconLine"></div>
    </div>
  </button>
</template>

<style module="s">
.sidebarToggle {
  grid-row: 1 / -1;
  grid-column: 1 / -1;
  display: grid;
  place-content: center;
  border: unset;
  position: relative;
  left: 1rem;
  top: 1rem;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  border-radius: 1rem;
  background-color: var(--overlay-0);

  &:hover {
    background-color: var(--overlay-1);
  }

  &:active {
    background-color: var(--overlay-2);
  }

  &:focus-visible {
    outline: 2px solid var(--lavender);
    outline-offset: 2px;
  }
}

.icon {
  grid-area: icon;
  display: grid;
  inline-size: 1rem;
  block-size: 0.75rem;
  grid-template:
    "icon-part-1" 0.125rem
    "." 1fr
    "icon-part-2" 0.125rem
    "." 1fr
    "icon-part-3" 0.125rem
    / 1rem;
}

.iconClose {
  grid-template: 1fr 0.175rem 1fr / 1fr 0.175rem 1fr;
  block-size: 1.25rem;
  inline-size: 1.25rem;
  transform: rotate(45deg);

  & > .iconLine {
    border-radius: 0.0875rem;

    &:nth-child(1) {
      grid-area: 1 / 2 / 4 / 3;
    }

    &:nth-child(2) {
      grid-area: 2 / 1 / 3 / 4;
    }

    &:nth-child(3) {
      display: none;
    }
  }
}

.iconLine {
  background-color: var(--base);

  &:nth-child(1) {
    grid-area: icon-part-1;
  }

  &:nth-child(2) {
    grid-area: icon-part-2;
  }

  &:nth-child(3) {
    grid-area: icon-part-3;
  }
}
</style>
