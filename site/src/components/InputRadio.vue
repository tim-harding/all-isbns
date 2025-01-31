<script setup lang="ts">
import { useId } from "vue";

const props = defineProps<{
  value: string;
}>();

const model = defineModel({
  required: true,
  type: String,
});

const id = useId();
</script>

<template>
  <div>
    <input
      :id="id"
      :value="props.value"
      v-model="model"
      type="radio"
      :class="{
        sr: true,
        [s.input]: true,
      }"
    />
    <label :for="id" :class="s.label">
      <div :class="s.circle">
        <div :class="s.overlay"></div>
        <div :class="s.indicator"></div>
      </div>
      <span :class="s.labelText">
        <slot></slot>
      </span>
    </label>
  </div>
</template>

<style module="s">
.input {
  &:checked ~ .label > .circle > .indicator {
    display: grid;
  }

  &:hover ~ .label > .circle > .overlay {
    background-color: var(--blue-a0);
  }

  &:active ~ .label > .circle > .overlay {
    background-color: var(--blue-a1);
  }

  &:focus-visible ~ .label > .circle {
    outline: 2px solid var(--lavender);
    outline-offset: 2px;
  }
}

.label {
  display: grid;
  grid-template: "circle text" 1.25rem / 1.25rem 1fr;
  column-gap: 1rem;
  align-items: center;
}

.circle {
  grid-area: circle;
  display: grid;
  grid-template:
    ". . ." 1fr
    ". indicator ." 0.5rem
    ". . ." 1fr
    / 1fr 0.5rem 1fr;
  border: 2px solid var(--blue);
  border-radius: 50%;
  background-color: white;
  block-size: 100%;
  inline-size: 100%;
}

.overlay {
  grid-area: 1 / 1 / -1 / -1;
  border-radius: 50%;
}

.indicator {
  display: none;
  grid-area: indicator;
  background-color: var(--blue);
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.labelText {
  grid-area: text;
  font-weight: 500;
}
</style>
