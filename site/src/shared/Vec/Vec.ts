export interface T {
  x: number;
  y: number;
}

export function make(x: number, y: number): T {
  return { x, y };
}

export function splat(n: number): T {
  return make(n, n);
}

export function zero(): T {
  return splat(0);
}

export function one(): T {
  return splat(1);
}

export function unitX(): T {
  return make(1, 0);
}

export function unitY(): T {
  return make(0, 1);
}

export function combine(a: T, b: T, fn: (a: number, b: number) => number): T {
  return make(fn(a.x, b.x), fn(a.y, b.y));
}

export function map(t: T, fn: (n: number) => number): T {
  return make(fn(t.x), fn(t.y));
}

export function scale(t: T, factor: number): T {
  return map(t, (n) => n * factor);
}

export function floor(t: T): T {
  return map(t, Math.floor);
}

export function ceil(t: T): T {
  return map(t, Math.ceil);
}

export function add(a: T, b: T): T {
  return combine(a, b, (a, b) => a + b);
}

export function sub(a: T, b: T): T {
  return combine(a, b, (a, b) => a - b);
}

export function mul(a: T, b: T): T {
  return combine(a, b, (a, b) => a * b);
}

export function div(a: T, b: T): T {
  return combine(a, b, (a, b) => a / b);
}

export function min(a: T, b: T): T {
  return combine(a, b, Math.min);
}

export function max(a: T, b: T): T {
  return combine(a, b, Math.max);
}

export function area(t: T): number {
  return t.x * t.y;
}
