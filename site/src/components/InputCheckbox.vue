<script setup lang="ts">
import { useId } from "vue";
import IconCheck from "./IconCheck.vue";

const model = defineModel({
  required: true,
  type: Boolean,
});

const id = useId();
</script>

<template>
  <div>
    <input
      :class="{ sr: true, [s.checkbox]: true }"
      :id="id"
      v-model="model"
      type="checkbox"
    />
    <label :class="s.label" :for="id">
      <div :class="s.control">
        <div :class="s.overlay"></div>
        <IconCheck :class="s.icon"></IconCheck>
      </div>
      <slot></slot>
    </label>
  </div>
</template>

<style module="s">
.checkbox {
  &:checked ~ .label > .control {
    background-color: var(--blue);
    border: none;

    & > .icon {
      display: unset;
    }
  }

  &:hover {
    & ~ .label > .control > .overlay {
      background-color: var(--blue-a0);
    }

    &:checked ~ .label > .control > .overlay {
      background-color: rgb(0 0 0 / 0.1);
    }
  }

  &:active {
    & ~ .label > .control > .overlay {
      background-color: var(--blue-a1);
    }

    &:checked ~ .label > .control > .overlay {
      background-color: rgb(0 0 0 / 0.25);
    }
  }

  &:focus-visible ~ .label > .control {
    outline: 2px solid var(--lavender);
    outline-offset: 2px;
  }
}

.label {
  display: grid;
  grid-auto-flow: column;
  grid-template: "control" 1.25rem / 1.25rem;
  column-gap: 1rem;
  font-weight: 500;
}

.control {
  grid-area: control;
  display: grid;
  grid-template: "full" 100% / 100%;
  background-color: blue;
  place-content: center;
  background-color: white;
  border: 1px solid var(--surface-2);
  border-radius: 0.25rem;
  overflow: hidden;
}

.overlay {
  grid-area: full;
}

.icon {
  grid-area: full;
  display: none;
  color: var(--base);
}
</style>
