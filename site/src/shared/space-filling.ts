import { H, W } from "./constant";

const enum Dir {
  Top,
  Diagonal,
}

export function spaceFilling(x: number, y: number): number {
  return sf(x, y, W, H, Dir.Top);
}

function sf(x: number, y: number, w: number, h: number, dir: Dir): number {
  if (w < h && dir == Dir.Diagonal) {
    const tmpX = x;
    x = y;
    y = tmpX;

    const tmpW = w;
    w = h;
    h = tmpW;
  }

  if (h === 1) {
    return x;
  }

  const w0 = Math.floor((w + 1) / 2);
  const w1 = w - w0;
  const w0Even = w0 % 2 === 0;
  const w1Even = w1 % 2 === 0;
  const hEven = h % 2 === 0;
  const top = dir === Dir.Top;

  return x < w0
    ? hEven
      ? top
        ? w0Even
          ? w1Even
            ? sf(x, y, w0, h, Dir.Top)
            : Infinity
          : w1Even
            ? Infinity
            : sf(x, y, w0, h, Dir.Diagonal)
        : // diagonal
          w0Even
          ? w1Even
            ? Infinity
            : sf(x, y, w0, h, Dir.Top)
          : w1Even
            ? sf(x, y, w0, h, Dir.Diagonal)
            : Infinity
      : // odd height
        top
        ? sf(x, y, w0, h, Dir.Diagonal)
        : sf(x, y, w0, h, Dir.Top)
    : // x >= w0
      hEven
      ? top
        ? w0Even
          ? w1Even
            ? w * h - 1 - sf(w - x - 1, y, w1, h, Dir.Top)
            : Infinity
          : w1Even
            ? Infinity
            : w * h - 1 - sf(w - x - 1, y, w1, h, Dir.Diagonal)
        : // diagonal
          w0Even
          ? w1Even
            ? Infinity
            : w0 * h + sf(x - w0, y, w1, h, Dir.Diagonal)
          : w1Even
            ? w0 * h + sf(x - w0, h - y - 1, w1, h, Dir.Top)
            : Infinity
      : // odd height
        top
        ? w * h - 1 - sf(w - x - 1, y, w1, h, Dir.Diagonal)
        : w0 * h + sf(x - w0, y, w1, h, Dir.Diagonal);
}
