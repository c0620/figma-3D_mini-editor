import type { Light } from "@/types/scene";
import type { TranslationKey } from "@/i18n/en";

export type SpotLightingPresetId = "soft" | "hard" | "flat";

export const SPOT_LIGHTING_PRESET_ROWS: SpotLightingPresetId[][] = [
  ["soft", "hard"],
  ["flat"],
];

export const SPOT_LIGHTING_PRESETS: {
  id: SpotLightingPresetId;
  labelKey: TranslationKey;
}[] = [
  { id: "soft", labelKey: "light.preset.soft" },
  { id: "hard", labelKey: "light.preset.hard" },
  { id: "flat", labelKey: "light.preset.flat" },
];

export function buildSpotLightingPresetPatch(
  preset: SpotLightingPresetId
): Partial<Light> {
  switch (preset) {
    case "soft":
      return { penumbra: 1, angle: Math.PI / 4 };
    case "hard":
      return { penumbra: 0, angle: Math.PI / 10 };
    case "flat":
      return { penumbra: 0.35, angle: Math.PI / 2.5 };
  }
}
