<script setup lang="ts">
import InputRadio from "./InputRadio.vue";

const props = defineProps<{
  options: [string, string][];
}>();

const model = defineModel({
  required: true,
  type: String,
});
</script>

<template>
  <fieldset :class="s.fieldset">
    <legend :class="s.legend">
      <slot></slot>
    </legend>
    <InputRadio
      v-for="option in props.options"
      v-model="model"
      :value="option[0]"
      >{{ option[1] }}</InputRadio
    >
  </fieldset>
</template>

<style module="s">
.fieldset {
  all: unset;
  display: grid;
  row-gap: 0.25rem;
}

.legend {
  font-weight: 600;
  padding-block-end: 0.5rem;
}
</style>
