import { ASPECT, H, MIP_SIZE, W } from "@/shared/constant";
import { Vec } from "@/shared/Vec";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// Spaces:
// mip:        [0, W/1024/2^l] x [0, H/1024/2^l]
// mipPx:      [0, W/2^l]      x [0, H/2^l]
// tex:        [0, 1]          x [0, 1]
// texPx:      [0, W]          x [0, H]
// viewport:   [0, 1]          x [0, 1]
// viewportPx: [0, sizeX]      x [0, sizeY]

function levelFactor(level: number): number {
  return Math.pow(2, level);
}

export const useViewportStore = defineStore("viewport", () => {
  const zoom = ref(0);
  const offset = ref(Vec.zero());
  const size = ref(Vec.zero());

  const zoomFactor = computed(() => levelFactor(zoom.value));

  function mipToTexPxFactor(level: number) {
    return MIP_SIZE * levelFactor(level);
  }

  function mipToTexPx(v: Vec.T, level: number): Vec.T {
    return Vec.scale(v, mipToTexPxFactor(level));
  }

  function texPxToMip(v: Vec.T, level: number): Vec.T {
    return Vec.scale(v, 1 / mipToTexPxFactor(level));
  }

  function mipToMipPx(v: Vec.T): Vec.T {
    return Vec.scale(v, MIP_SIZE);
  }

  function mipPxToMip(v: Vec.T): Vec.T {
    return Vec.scale(v, 1 / MIP_SIZE);
  }

  function texToTexPx(v: Vec.T): Vec.T {
    return Vec.mul(v, Vec.make(W, H));
  }

  function texPxToTex(v: Vec.T): Vec.T {
    return Vec.div(v, Vec.make(W, H));
  }

  function texToViewport(v: Vec.T): Vec.T {
    return Vec.scale(Vec.add(v, offset.value), zoomFactor.value);
  }

  function viewportToTex(v: Vec.T): Vec.T {
    return Vec.sub(Vec.scale(v, 1 / zoomFactor.value), offset.value);
  }

  function clampedSize() {
    let { x, y } = size.value;
    const isWide = x / y >= ASPECT;
    if (isWide) {
      x = y * ASPECT;
    } else {
      y = x / ASPECT;
    }
    const offset = Vec.scale(Vec.sub(size.value, { x, y }), 0.5);
    return { size: { x, y }, offset };
  }

  function viewportToViewportPx(v: Vec.T): Vec.T {
    const { size, offset } = clampedSize();
    return Vec.add(Vec.mul(v, size), offset);
  }

  function viewportPxToViewport(v: Vec.T): Vec.T {
    const { size, offset } = clampedSize();
    return Vec.div(Vec.sub(v, offset), size);
  }

  function tilesAtLevel(level: number): Vec.T {
    return Vec.map(texPxToMip(texToTexPx(Vec.one()), level), Math.ceil);
  }

  function viewportToMip(v: Vec.T, level: number): Vec.T {
    return texPxToMip(texToTexPx(viewportToTex(v)), level);
  }

  function* visibleTiles(level: number): Generator<Vec.T> {
    const tileTl = Vec.max(
      Vec.zero(),
      Vec.map(
        viewportToMip(viewportPxToViewport(Vec.zero()), level),
        Math.floor
      )
    );
    const tileBr = Vec.min(
      tilesAtLevel(level),
      Vec.map(viewportToMip(viewportPxToViewport(size.value), level), Math.ceil)
    );
    for (let y = tileTl.y; y < tileBr.y; y++) {
      for (let x = tileTl.x; x < tileBr.x; x++) {
        yield { x, y };
      }
    }
  }

  function desiredLevel() {
    const vpTexPx = W / zoomFactor.value;
    const vpPx = size.value.x;
    const ratio = vpTexPx / vpPx;
    const level = Math.min(6, Math.max(0, Math.floor(Math.log2(ratio))));
    return level;
  }

  return {
    zoom,
    offset,
    size,
    zoomFactor,
    mipToMipPx,
    mipPxToMip,
    texToTexPx,
    texPxToTex,
    viewportToViewportPx,
    viewportPxToViewport,
    mipToTexPx,
    texPxToMip,
    viewportToTex,
    texToViewport,
    visibleTiles,
    desiredLevel,
  };
});
