import { unwrap } from "../util";

export type T = {
  r: number;
  g: number;
  b: number;
};

const PATTERN = /^#([0-f]{2})([0-f]{2})([0-f]{2})$/;

export function make(r: number, g: number, b: number): T {
  return { r, g, b };
}

export function toHex(t: T): string {
  const r = t.r.toString(16);
  const g = t.g.toString(16);
  const b = t.b.toString(16);
  return `#${r}${g}${b}`;
}

export function parseHex(hex: string): T {
  const [, rStr, gStr, bStr] = unwrap(hex.match(PATTERN), "invalid hex color");
  const r = Number.parseInt(unwrap(rStr), 16);
  const g = Number.parseInt(unwrap(gStr), 16);
  const b = Number.parseInt(unwrap(bStr), 16);
  return { r, g, b };
}

export function white(): T {
  return make(255, 255, 255);
}

export function normalized(t: T): T {
  return make(t.r / 255, t.g / 255, t.b / 255);
}
