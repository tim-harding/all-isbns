<script setup lang="ts">
import { useResizeDirective } from "@/usables/useResizeDirective";
import { Vec } from "@/shared/Vec";
import { useHoverStore } from "@/stores/hoverStore";
import { useUiStore } from "@/stores/uiStore";
import { useViewportStore } from "@/stores/viewportStore";
import { onMounted, useTemplateRef, watch } from "vue";
import { unwrap } from "@/shared/util";
import { useDrawing } from "@/drawing/webgl";
import { datasetNames } from "@/drawing/image-cache";

const ui = useUiStore();
const vp = useViewportStore();
const hover = useHoverStore();
const vResize = useResizeDirective();
const canvas = useTemplateRef("canvas");

onMounted(() => {
  const { requestRedraw } = useDrawing(unwrap(canvas.value));
  watch(
    [
      ...datasetNames.flatMap((name) => [
        () => ui.datasets[name].isEnabled,
        () => ui.datasets[name].color,
      ]),
      () => ui.layoutMode,
      () => ui.blendMode,
      () => ui.isCountryOverlayShown,
      () => vp.zoom,
      () => vp.size,
      () => vp.offset,
      () => hover.countryIndex,
    ],
    () => {
      requestRedraw();
    }
  );
  requestRedraw();
});

function scaleDpr(v: Vec.T) {
  return Vec.scale(v, window.devicePixelRatio);
}

function mousePosition(e: MouseEvent) {
  const { offsetX: x, offsetY: y } = e;
  return scaleDpr({ x, y });
}
</script>

<template>
  <canvas
    ref="canvas"
    v-resize="(size) => (vp.size = size)"
    @mousedown="ui.isDragging = true"
    @mouseup="ui.isDragging = false"
    @mouseenter="(e) => (hover.position = mousePosition(e))"
    @mouseleave="hover.position = null"
    @mousemove="
      (e) => {
        hover.position = hover.position === null ? null : mousePosition(e);

        if (!ui.isDragging) return;
        const { movementX: x, movementY: y } = e;
        const pos = scaleDpr({ x, y });
        vp.offset = Vec.add(
          vp.offset,
          Vec.scale(pos, 1 / vp.zoomFactor / Math.min(vp.size.x, vp.size.y))
        );
      }
    "
    @wheel="
      (e) => {
        const pos = mousePosition(e);
        const oldMouseLayout = vp.viewportToTex(vp.viewportPxToViewport(pos));
        vp.zoom -= e.deltaY / 500;
        const newMouseLayout = vp.viewportToTex(vp.viewportPxToViewport(pos));
        const delta = Vec.sub(newMouseLayout, oldMouseLayout);
        vp.offset = Vec.add(vp.offset, delta);
      }
    "
  ></canvas>
</template>
