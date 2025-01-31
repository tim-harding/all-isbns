export interface Key {
  dataset: Dataset;
  mode: Mode;
  level: number;
  x: number;
  y: number;
}

export type Dataset = keyof Datasets;
export type Mode = keyof Modes;

export interface Datasets {
  oclc: Modes;
  gbooks: Modes;
  md5: Modes;
  ol: Modes;
  isbndb: Modes;
  trantor: Modes;
  rgb: Modes;
  nexusstc: Modes;
  libby: Modes;
  isbngrp: Modes;
  ia: Modes;
  goodreads: Modes;
  edsebk: Modes;
  duxiu: Modes;
  cerlalc: Modes;
  cadal: Modes;
}

export interface Modes {
  scanline: Tiles;
  spacefilling: Tiles;
}

export type Tiles = Value[][][];

export interface ValueLoading {
  kind: "loading";
}

export interface ValueLoaded {
  kind: "loaded";
  texture: WebGLTexture;
}

export type Value = ValueLoading | ValueLoaded;

export interface Kv {
  key: Key;
  value: Value;
}

export const cache: Datasets = {
  oclc: { scanline: [], spacefilling: [] },
  gbooks: { scanline: [], spacefilling: [] },
  md5: { scanline: [], spacefilling: [] },
  ol: { scanline: [], spacefilling: [] },
  isbndb: { scanline: [], spacefilling: [] },
  trantor: { scanline: [], spacefilling: [] },
  rgb: { scanline: [], spacefilling: [] },
  nexusstc: { scanline: [], spacefilling: [] },
  libby: { scanline: [], spacefilling: [] },
  isbngrp: { scanline: [], spacefilling: [] },
  ia: { scanline: [], spacefilling: [] },
  goodreads: { scanline: [], spacefilling: [] },
  edsebk: { scanline: [], spacefilling: [] },
  duxiu: { scanline: [], spacefilling: [] },
  cerlalc: { scanline: [], spacefilling: [] },
  cadal: { scanline: [], spacefilling: [] },
};

export const datasetNames = Object.keys(cache) as Dataset[];
export const modeNames = Object.keys(cache.oclc) as Mode[];

export const countryLuts = {
  scanline: null as WebGLTexture | null,
  spacefilling: null as WebGLTexture | null,
};

export function loadLut(
  mode: Mode,
  cb: (image: HTMLImageElement) => WebGLTexture
) {
  const image = document.createElement("img");
  image.addEventListener("load", () => {
    countryLuts[mode] = cb(image);
  });
  image.src = `/images/country_lut_${mode}.png`;
}

export function urlForKey({ level, x, y, dataset, mode }: Key): string {
  return `/images/mip_${level}_${x}_${y}_${dataset}_${mode}.png`;
}

export function loadTile(
  key: Key,
  cb: (image: HTMLImageElement) => WebGLTexture
) {
  const cached = getValue(key);
  if (cached !== null) return;
  setValue(key, { kind: "loading" });
  const image = document.createElement("img");
  image.addEventListener("load", () => {
    const texture = cb(image);
    setValue(key, { kind: "loaded", texture });
  });
  image.src = urlForKey(key);
}

function setValue(key: Key, value: Value) {
  cache[key.dataset] = cache[key.dataset];
  const tiles = cache[key.dataset][key.mode];

  let level = tiles[key.level];
  if (level === undefined) {
    level = [];
    tiles[key.level] = level;
  }

  let y = level[key.y];
  if (y === undefined) {
    y = [];
    level[key.y] = y;
  }

  y[key.x] = value;
}

export function getValue(key: Key): Value | null {
  const tiles = cache[key.dataset][key.mode];
  const level = tiles[key.level];
  if (level === undefined) return null;
  const y = level[key.y];
  if (y === undefined) return null;
  const x = y[key.x];
  if (x === undefined) return null;
  return x;
}
