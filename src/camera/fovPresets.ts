import fov15Icon from "@/assets/images/icons/descriptive/fov15.svg";
import fov35Icon from "@/assets/images/icons/descriptive/fov35.svg";
import fov50Icon from "@/assets/images/icons/descriptive/fov50.svg";
import fov70Icon from "@/assets/images/icons/descriptive/fov70.svg";
import fov400Icon from "@/assets/images/icons/descriptive/fov400.svg";
import lensIcon from "@/assets/images/icons/descriptive/lens.svg";
import type { TranslationKey } from "@/i18n/en";

const SENSOR_WIDTH_MM = 36;

function focalLengthToFov(focalLengthMm: number): number {
  return (
    (2 * Math.atan(SENSOR_WIDTH_MM / (2 * focalLengthMm)) * 180) / Math.PI
  );
}

export type FovPresetId = "fov15" | "fov35" | "fov50" | "fov70" | "fov400";

export type FovPreset = {
  id: FovPresetId;
  icon: string;
  focalLengthMm: number;
  fov: number;
  labelKey: TranslationKey;
};

export const FOV_PRESETS: FovPreset[] = [
  {
    id: "fov15",
    icon: fov15Icon,
    focalLengthMm: 15,
    fov: focalLengthToFov(15),
    labelKey: "camera.fov.preset.fov15",
  },
  {
    id: "fov35",
    icon: fov35Icon,
    focalLengthMm: 35,
    fov: focalLengthToFov(35),
    labelKey: "camera.fov.preset.fov35",
  },
  {
    id: "fov50",
    icon: fov50Icon,
    focalLengthMm: 50,
    fov: focalLengthToFov(50),
    labelKey: "camera.fov.preset.fov50",
  },
  {
    id: "fov70",
    icon: fov70Icon,
    focalLengthMm: 70,
    fov: focalLengthToFov(70),
    labelKey: "camera.fov.preset.fov70",
  },
  {
    id: "fov400",
    icon: fov400Icon,
    focalLengthMm: 400,
    fov: focalLengthToFov(400),
    labelKey: "camera.fov.preset.fov400",
  },
];

export const FOV_MATCH_TOLERANCE = 0.5;

export function findNearestFovPreset(fov: number): FovPreset {
  return FOV_PRESETS.reduce((best, preset) => {
    const bestDelta = Math.abs(best.fov - fov);
    const presetDelta = Math.abs(preset.fov - fov);
    return presetDelta < bestDelta ? preset : best;
  }, FOV_PRESETS[0]);
}

export function findExactFovPreset(fov: number): FovPreset | null {
  return (
    FOV_PRESETS.find(
      (preset) => Math.abs(preset.fov - fov) <= FOV_MATCH_TOLERANCE
    ) ?? null
  );
}

export { lensIcon };
