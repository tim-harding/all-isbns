import { Vec } from "../Vec";
import { expect } from "../util";

export interface T {
  /** Top left */
  tl: Vec.T;
  /** Bottom right */
  br: Vec.T;
}

export function make(tl: Vec.T, br: Vec.T): T {
  expect(tl.x <= br.x && tl.y <= br.y);
  return { tl, br };
}

export function boundary(br: Vec.T): T {
  return make(Vec.zero(), br);
}

export function unitAt(tl: Vec.T): T {
  return make(tl, Vec.add(tl, Vec.one()));
}

export function areIntersecting(a: T, b: T): boolean {
  return !(
    a.tl.x > b.br.x ||
    a.tl.y > b.br.y ||
    a.br.x < b.tl.x ||
    a.br.y < b.tl.y
  );
}

export function transform(t: T, fn: (v: Vec.T) => Vec.T): T {
  return make(fn(t.tl), fn(t.br));
}

export function clip(t: T, bound: T): T {
  const tl = Vec.max(t.tl, bound.tl);
  const br = Vec.min(t.br, bound.br);
  // If t and bound are disjoint, we may end up with tl > br,
  // so we need to do one more max
  return make(tl, Vec.max(tl, br));
}

export function size(t: T): Vec.T {
  return Vec.make(t.br.x - t.tl.x, t.br.y - t.tl.y);
}
