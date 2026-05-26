import type { HdriPresetId } from "../types/scene";

/** Тот же CDN, что использует `@react-three/drei` для `Environment preset`. */
export const DREI_HDRI_ROOT =
  "https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/";

const DREI_HDRI_FILES: Record<HdriPresetId, string> = {
  studio: "studio_small_03_1k.hdr",
  sunset: "venice_sunset_1k.hdr",
  warehouse: "empty_warehouse_01_1k.hdr",
};

export interface HdriPresetOption {
  id: HdriPresetId;
  labelKey: `light.hdriPreset.${HdriPresetId}`;
}

export const HDRI_PRESETS: HdriPresetOption[] = [
  { id: "studio", labelKey: "light.hdriPreset.studio" },
  { id: "sunset", labelKey: "light.hdriPreset.sunset" },
  { id: "warehouse", labelKey: "light.hdriPreset.warehouse" },
];

export function getHdriPresetUrl(presetId: HdriPresetId): string {
  const file = DREI_HDRI_FILES[presetId] ?? DREI_HDRI_FILES.studio;
  return `${DREI_HDRI_ROOT}${file}`;
}
