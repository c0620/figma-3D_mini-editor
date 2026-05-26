import type { HdriPresetId, Light, LightType, Transform } from "../types/scene";
import { randomUUID } from "../lib/randomId";

const DEFAULT_TRANSFORM: Transform = {
  position: [0, 5, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

export const DEFAULT_SPOT_TARGET: [number, number, number] = [0, 0, 0];

export const DEFAULT_HDRI_PRESET: HdriPresetId = "studio";

type LegacyLightType = LightType | "Directional" | "Point" | undefined;

type LegacyLight = Partial<Light> & {
  type?: LegacyLightType;
};

function migrateLegacyLightType(type: LegacyLightType): LightType {
  switch (type) {
    case "Spot":
    case "Ambient":
    case "HDRI":
      return type;
    case "Point":
      return "Ambient";
    case "Directional":
      return "Spot";
    default:
      return "Ambient";
  }
}

export function createDefaultLight(overrides: Partial<Light> = {}): Light {
  return {
    id: overrides.id ?? randomUUID(),
    type: overrides.type ?? "Ambient",
    color: overrides.color ?? "#ffffff",
    intensity: overrides.intensity ?? 1,
    visible: overrides.visible ?? true,
    locked: overrides.locked ?? false,
    pendingDelete: overrides.pendingDelete ?? false,
    transform: overrides.transform ?? DEFAULT_TRANSFORM,
    distance: overrides.distance ?? 0,
    penumbra: overrides.penumbra ?? 0,
    angle: overrides.angle ?? Math.PI / 6,
    target: overrides.target ?? DEFAULT_SPOT_TARGET,
    hdriPreset: overrides.hdriPreset ?? DEFAULT_HDRI_PRESET,
  };
}

/** Добавляет ambient, если в сцене ещё нет источников света. */
export function withDefaultAmbientLight(lights: Light[]): Light[] {
  if (lights.length > 0) return lights;
  return [createDefaultLight({ type: "Ambient" })];
}

export function normalizeLight(light: LegacyLight): Light {
  const type = migrateLegacyLightType(light.type);
  return createDefaultLight({
    ...light,
    type,
    transform: light.transform ?? DEFAULT_TRANSFORM,
    target: light.target ?? DEFAULT_SPOT_TARGET,
    hdriPreset: (light.hdriPreset as HdriPresetId | undefined) ?? DEFAULT_HDRI_PRESET,
  });
}

export function applyLightTypeDefaults(
  prev: Light,
  nextType: LightType
): Partial<Light> {
  if (prev.type === nextType) return {};

  const patch: Partial<Light> = { type: nextType };

  if (nextType === "Spot" && prev.type !== "Spot") {
    patch.target = prev.target ?? DEFAULT_SPOT_TARGET;
    patch.distance = prev.distance ?? 0;
    patch.penumbra = prev.penumbra ?? 0;
    patch.angle = prev.angle ?? Math.PI / 6;
  }

  if (nextType === "HDRI" && prev.type !== "HDRI") {
    patch.hdriPreset = prev.hdriPreset ?? DEFAULT_HDRI_PRESET;
  }

  return patch;
}
