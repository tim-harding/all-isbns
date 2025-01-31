import { Vec } from "@/shared/Vec";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { H, ISBN_START, W } from "@/shared/constant";
import countries from "@/shared/countries.json";
import { binarySearch } from "@/shared/util";
import { useViewportStore } from "./viewportStore";
import { useUiStore } from "./uiStore";
import { spaceFilling } from "@/shared/space-filling";

function checkDigit(isbn: number): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = isbn % 10;
    const coefficient = i % 2 === 0 ? 3 : 1;
    sum += digit * coefficient;
    isbn = Math.floor(isbn / 10);
  }
  return (10 - (sum % 10)) % 10;
}

export const useHoverStore = defineStore("hover", () => {
  const vp = useViewportStore();
  const ui = useUiStore();
  const position = ref(null as Vec.T | null);

  const positionDpr = computed(() =>
    position.value === null
      ? null
      : Vec.scale(position.value, 1 / window.devicePixelRatio)
  );

  const isbn = computed(() => {
    if (position.value === null) return null;
    const { x, y } = Vec.floor(
      vp.texToTexPx(vp.viewportToTex(vp.viewportPxToViewport(position.value)))
    );
    if (x < 0 || x >= W || y < 0 || y >= H) return null;
    const i = ui.layoutMode === "scanline" ? y * W + x : spaceFilling(x, y);
    return ISBN_START + i;
  });

  const isbnString = computed(() =>
    isbn.value === null ? "" : `${isbn.value}${checkDigit(isbn.value)}`
  );

  const countryIndex = computed(() => {
    if (isbn.value === null) return null;
    const needle = Math.floor((isbn.value - ISBN_START) / 10000);
    const { index } = binarySearch(needle, countries.isbnStart);
    return countries.countryIndex[index - 1];
  });

  const country = computed(() => {
    if (countryIndex.value === null) return "";
    return countries.country[countryIndex.value];
  });

  return { position, positionDpr, isbn, isbnString, countryIndex, country };
});
