import type { HdriPresetId } from "../types/scene";

import { getHdriBlobUrl } from "./hdriAssets";

export interface HdriPresetOption {
  id: HdriPresetId;
  labelKey: `light.hdriPreset.${HdriPresetId}`;
}

export const HDRI_PRESETS: HdriPresetOption[] = [
  { id: "studio", labelKey: "light.hdriPreset.studio" },
  { id: "sunset", labelKey: "light.hdriPreset.sunset" },
  { id: "warehouse", labelKey: "light.hdriPreset.warehouse" },
];

/** Абсолютный `blob:` URL — для RGBELoader / drei Environment в sandbox Figma. */
export function getHdriPresetUrl(presetId: HdriPresetId): string {
  return getHdriBlobUrl(presetId);
}
