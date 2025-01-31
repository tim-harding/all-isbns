<script setup lang="ts">
import { datasetNames } from "@/drawing/image-cache";
import Dataset from "./Dataset.vue";
</script>

<template>
  <table :class="s.datasets">
    <caption class="sr">
      Datasets
    </caption>
    <thead :class="s.headers">
      <tr :class="s.contents">
        <th scope="col" :class="s.headerDataset">Dataset</th>
        <th scope="col" :class="s.headerEnabled">Enabled</th>
        <th scope="col" :class="s.headerColor">Color</th>
      </tr>
    </thead>
    <tbody :class="s.contents">
      <Dataset v-for="name in datasetNames" :name="name"></Dataset>
    </tbody>
  </table>
</template>

<style module="s">
.datasets {
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  grid-template-columns: 1fr max-content max-content;
  width: 14rem;
  column-gap: 1rem;
  row-gap: 0.75rem;
}

.headers {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  padding-block-end: 0.25rem;
}

.headerDataset {
  text-align: start;
}

.headerEnabled {
  text-align: end;
}

.headerColor {
  text-align: end;
}

.headerDataset,
.headerEnabled,
.headerColor {
  font-weight: 600;
}

.contents {
  display: contents;
}
</style>
