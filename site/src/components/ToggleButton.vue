<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emits = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <button
    @mousedown="emits('update:modelValue', !props.modelValue)"
    :aria-pressed="props.modelValue"
    :class="s.toggleButton"
  >
    <div :class="s.slider">
      <div :class="s.nubbin"></div>
    </div>
    <span :class="s.label">
      <slot></slot>
    </span>
  </button>
</template>

<style module="s">
.toggleButton {
  display: grid;
  grid-template: "slider label" 1.5rem / 2.5rem 1fr;
  align-items: center;
  column-gap: 1rem;
  background: none;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  font-weight: 500;

  &[aria-pressed="true"] > .slider > .nubbin {
    justify-self: end;
  }

  &:hover > .slider > .nubbin {
    background-color: var(--overlay-2);
  }

  &:active > .slider > .nubbin {
    background-color: var(--subtext-0);
  }

  &:focus-visible {
    outline: none;

    & > .slider {
      outline: 2px solid var(--lavender);
      outline-offset: 2px;
    }
  }
}

.slider {
  display: grid;
  grid-template: 1fr / 1fr;
  block-size: 100%;
  inline-size: 100%;
  background-color: var(--surface-0);
  border-radius: 0.75rem;
  padding: 3px;
  box-shadow: 0px 0px 2px 0px inset rgba(0, 0, 0, 0.1);
}

.nubbin {
  --size: calc(1.5rem - 6px);
  block-size: var(--size);
  inline-size: var(--size);
  background-color: var(--overlay-1);
  border-radius: 50%;
}

.label {
  grid-area: label;
  text-align: start;
}
</style>
