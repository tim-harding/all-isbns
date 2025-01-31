<script setup lang="ts">
import { useHoverStore } from "@/stores/hoverStore";
import { computed } from "vue";
import { Vec } from "@/shared/Vec";
import { useUiStore } from "@/stores/uiStore";

const hover = useHoverStore();
const ui = useUiStore();
const pos = computed(() => hover.positionDpr ?? Vec.splat(0));
</script>

<template>
  <div
    :class="{
      [s.tooltip]: true,
      [s.hide]: !ui.isTooltipShown || hover.isbn === null,
    }"
  >
    <div :class="s.inner">
      <dl :class="s.content">
        <dt :class="s.labelIsbn">ISBN</dt>
        <dd :class="s.isbn">{{ hover.isbnString }}</dd>
        <dt :class="s.labelCountry">Country</dt>
        <dd :class="s.country">{{ hover.country }}</dd>
      </dl>
      <div :class="s.arrow"></div>
    </div>
  </div>
</template>

<style module="s">
.tooltip {
  position: absolute;
  pointer-events: none;
  --tx: v-bind("pos.x");
  --ty: v-bind("pos.y");
  transform: translate(calc(var(--tx) * 1px), calc(var(--ty) * 1px));
}

.hide {
  display: none;
}

.inner {
  display: grid;
  grid-template:
    "content content content" 1fr
    ". arrow ." 0.5rem
    / 1fr 1rem 1fr;
  transform: translate(-50%, -100%);
}

.content {
  grid-area: content;
  display: grid;
  grid-template:
    "label-isbn isbn" max-content
    "label-country country" 1fr
    / max-content 1fr;
  column-gap: 0.75rem;
  row-gap: 0.5rem;
  background-color: var(--mantle);
  border-radius: 0.5rem;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  width: 16rem;
  --shadow: rgb(0 0 0 / 0.06);
  box-shadow:
    0px 1px 2px 0px var(--shadow),
    0px 2px 4px 0px var(--shadow),
    0px 4px 8px 0px var(--shadow),
    0px 8px 16px 0px var(--shadow),
    0px 1px 2px 0px inset rgb(255 255 255 / 0.2);
}

.arrow {
  grid-area: arrow;
  background-color: var(--mantle);
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
}

.labelIsbn {
  grid-area: label-isbn;
  font-weight: 700;
}

.isbn {
  grid-area: isbn;
}

.labelCountry {
  grid-area: label-country;
  font-weight: 700;
}

.country {
  grid-area: country;
}
</style>
