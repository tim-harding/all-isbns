<script setup lang="ts">
import { Rgb } from "@/shared/Rgb";
import { expect, unwrap } from "@/shared/util";
import { useId } from "vue";

const props = defineProps<{
  modelValue: Rgb.T;
}>();

const emits = defineEmits<{
  "update:modelValue": [value: Rgb.T];
}>();

const id = useId();

function handleInput(e: Event) {
  const target = unwrap(e.target);
  expect(target instanceof HTMLInputElement);
  const color = Rgb.parseHex(target.value);
  emits("update:modelValue", color);
}
</script>

<template>
  <div>
    <input
      :class="s.input"
      :id="id"
      :value="Rgb.toHex(props.modelValue)"
      @input="handleInput"
      type="color"
    />
    <label :for="id">
      <slot></slot>
    </label>
  </div>
</template>

<style module="s">
.input {
  all: unset;
  display: grid;
  grid-auto-flow: column;
  width: 2.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--surface-2);

  &:hover {
    border-color: var(--overlay-1);
  }

  &:active {
    border-color: var(--subtext-0);
  }

  &:focus-visible {
    outline: 2px solid var(--lavender);
    outline-offset: 2px;
  }

  &::-webkit-color-swatch-wrapper {
    padding: 0rem;
  }

  &::-webkit-color-swatch {
    border: none;
  }

  &::-moz-color-swatch {
    border: none;
  }
}
</style>
