<script setup lang="ts">
import type { Dataset } from "@/drawing/image-cache";
import { useUiStore } from "@/stores/uiStore";
import { toRef } from "vue";
import InputColor from "./InputColor.vue";
import InputCheckbox from "./InputCheckbox.vue";

const props = defineProps<{
  name: Dataset;
}>();

const store = useUiStore();
const dataset = toRef(() => store.datasets[props.name]);
</script>

<template>
  <tr :class="s.dataset">
    <th scope="row" :class="s.heading">{{ name }}</th>
    <td :class="s.enabled">
      <InputCheckbox v-model="dataset.isEnabled">
        <span class="sr">Enabled</span>
      </InputCheckbox>
    </td>
    <td :class="s.color">
      <InputColor v-model="dataset.color">
        <span class="sr">Color</span>
      </InputColor>
    </td>
  </tr>
</template>

<style module="s">
.dataset {
  all: unset;
  grid-column: 1 / 4;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-areas: "heading enabled color";
  align-items: center;
}

.heading {
  all: unset;
  grid-area: heading;
  font-weight: 500;
}

.enabled {
  grid-area: enabled;
  justify-self: end;
}

.color {
  grid-area: color;
  justify-self: end;
}
</style>
