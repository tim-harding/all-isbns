<script setup lang="ts">
import { useUiStore } from "@/stores/uiStore";
import ToggleButton from "./ToggleButton.vue";
import Datasets from "./Datasets.vue";
import RadioGroup from "./RadioGroup.vue";

const store = useUiStore();
</script>

<template>
  <div :class="s.sidebar">
    <div :class="s.inner">
      <div :class="s.controls">
        <div :class="s.toggles">
          <ToggleButton v-model="store.isTooltipShown">Tooltip</ToggleButton>
          <ToggleButton v-model="store.isCountryOverlayShown"
            >Country overlay</ToggleButton
          >
        </div>
        <RadioGroup
          v-model="store.layoutMode"
          :options="[
            ['scanline', 'Scanline'],
            ['spacefilling', 'Space filling curve'],
          ]"
          >Layout mode</RadioGroup
        >
        <RadioGroup
          v-model="store.blendMode"
          :options="[
            ['union', 'Union'],
            ['intersect', 'Intersect'],
          ]"
          >Blend mode</RadioGroup
        >
      </div>

      <Datasets :class="s.datasets"></Datasets>
    </div>
  </div>
</template>

<style module="s">
.sidebar {
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--mantle);
  --shadow: rgb(0 0 0 / 0.01);
  box-shadow: 0px 0px 1px 1px var(--shadow), 0px 0px 2px 2px var(--shadow),
    0px 0px 4px 4px var(--shadow), 0px 0px 8px 8px var(--shadow),
    0px 0px 16px 16px var(--shadow), 0px 0px 32px 32px var(--shadow);
}

.inner {
  display: grid;
  grid-template:
    ". controls ." max-content
    ". datasets ." max-content
    / 1rem 1fr 1rem;
  padding-block-start: 4.5rem;
  padding-block-end: 1rem;
  row-gap: 1.5rem;
}

.controls {
  grid-area: controls;
  display: grid;
  row-gap: 1.25rem;
}

.datasets {
  grid-area: datasets;
}

.toggles {
  display: grid;
  row-gap: 0.75rem;
}
</style>
