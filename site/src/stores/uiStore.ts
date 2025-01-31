import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { datasetNames, type Dataset, type Mode } from "@/drawing/image-cache";
import { Rgb } from "@/shared/Rgb";
import { useStorageAsync, type RemovableRef } from "@vueuse/core";

interface DatasetState {
  isEnabled: boolean;
  color: Rgb.T;
}

type BlendMode = "union" | "intersect";

export const useUiStore = defineStore("ui", () => {
  const isDragging = ref(false);
  const isSidebarOpen = ref(true);
  const isTooltipShown = useStorageAsync("is-tooltip-shown", true);
  const layoutMode = useStorageAsync(
    "layout-mode",
    "scanline"
  ) as RemovableRef<Mode>;
  const blendMode = useStorageAsync(
    "blend-mode",
    "union"
  ) as RemovableRef<BlendMode>;
  const datasets = reactive(
    datasetNames.reduce(
      (acc, name) => ({
        ...acc,
        [name]: {
          isEnabled: useStorageAsync(
            `dataset-${name}-is-enabled`,
            name === "oclc"
          ),
          color: useStorageAsync(`dataset-${name}-color`, Rgb.white()),
        },
      }),
      {}
    ) as { [K in Dataset]: DatasetState }
  );

  return {
    isDragging,
    isSidebarOpen,
    isTooltipShown,
    layoutMode,
    blendMode,
    datasets,
  };
});
