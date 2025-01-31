<script setup lang="ts">
import { useUiStore } from "@/stores/uiStore";
import Canvas from "./Canvas.vue";
import Tooltip from "./Tooltip.vue";
import SidebarToggle from "./SidebarToggle.vue";
import Sidebar from "./Sidebar.vue";

const store = useUiStore();
</script>

<template>
  <div
    :class="{
      [s.viewer]: true,
      [s.viewerCollapsed]: !store.isSidebarOpen,
    }"
  >
    <div :class="s.canvasContainer">
      <Canvas :class="s.canvas"></Canvas>
      <Tooltip :class="s.tooltip"></Tooltip>
    </div>

    <SidebarToggle></SidebarToggle>
    <Sidebar :class="s.sidebar"></Sidebar>
  </div>
</template>

<style module="s">
.viewer {
  --sidebar-width: 16rem;
  display: grid;
  grid-template: "controls canvas" 100% / var(--sidebar-width) calc(
      100% - var(--sidebar-width)
    );
  transition: grid-template 0.125s;
  contain: strict;
  width: 100%;
  height: 100%;
  background-color: var(--crust);
  color: var(--text);
  scrollbar-color: var(--overlay-0) var(--crust);
  scrollbar-width: thin;
  font-family: sans-serif;
}

.viewerCollapsed {
  grid-template-columns: 0rem 100%;
}

.canvasContainer {
  position: relative;
  grid-area: canvas;
  display: grid;
  grid-template: "full" 100% / 100%;
  width: 100%;
  height: 100%;
}

.canvas {
  grid-area: full;
  width: 100%;
  height: 100%;
}

.tooltip {
  grid-area: full;
}

.sidebar {
  grid-area: controls;
}
</style>
