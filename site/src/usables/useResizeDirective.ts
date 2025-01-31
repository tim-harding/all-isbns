import { expectDefined } from "../shared/util";
import { Vec } from "@/shared/Vec";
import type { Directive } from "vue";

export function useResizeDirective(): Directive<
  HTMLElement,
  (v: Vec.T) => void,
  string,
  string
> {
  let cb = (_: Vec.T) => {};

  function scaling() {
    const dpr = window.devicePixelRatio;
    const cbScale = (x: number, y: number) =>
      cb(Vec.map(Vec.make(x, y), (n) => Math.round(n * dpr)));
    return { dpr, cbScale };
  }

  const observer = new ResizeObserver((entries) => {
    const { cbScale } = scaling();
    for (const entry of entries) {
      if (entry.devicePixelContentBoxSize) {
        const size = entry.devicePixelContentBoxSize[0];
        expectDefined(size);
        const { inlineSize: x, blockSize: y } = size;
        cb({ x, y });
      } else if (entry.borderBoxSize) {
        const size = entry.borderBoxSize[0];
        expectDefined(size);
        const { inlineSize: x, blockSize: y } = size;
        cbScale(x, y);
      } else if (entry.contentBoxSize) {
        const size = entry.contentBoxSize[0];
        expectDefined(size);
        const { inlineSize: x, blockSize: y } = size;
        cbScale(x, y);
      } else {
        const { width: x, height: y } = entry.contentRect;
        cbScale(x, y);
      }
    }
  });

  return {
    mounted(el, { value }) {
      cb = value;

      let dprPrevious = window.devicePixelRatio;
      window.addEventListener("resize", () => {
        const { dpr, cbScale } = scaling();
        if (dpr !== dprPrevious) {
          const { clientWidth: x, clientHeight: y } = el;
          cbScale(x, y);
        }
        dprPrevious = dpr;
      });

      try {
        observer.observe(el, { box: "device-pixel-content-box" });
      } catch (e) {
        observer.observe(el, { box: "content-box" });
      }
    },

    updated(_, { value }) {
      cb = value;
    },

    unmounted(el) {
      observer.unobserve(el);
    },
  };
}
