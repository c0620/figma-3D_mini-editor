import { Object3D, Vector3 } from "three";

import type { LightPatch } from "../store/sceneStore";
import type { Light, StandardCameraPresetId } from "../types/scene";
import { cameraOrbitDistance } from "../types/scene";

const POSITION_OFFSETS: Record<
  StandardCameraPresetId,
  [number, number, number]
> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  right: [1, 0, 0],
  left: [-1, 0, 0],
};

export const SPOT_LIGHT_POSITION_PRESETS: StandardCameraPresetId[] = [
  "front",
  "back",
  "top",
  "bottom",
  "left",
  "right",
];

function rotationFromLookAt(
  position: [number, number, number],
  target: [number, number, number]
): [number, number, number] {
  const obj = new Object3D();
  obj.position.set(...position);
  obj.lookAt(new Vector3(...target));
  return [obj.rotation.x, obj.rotation.y, obj.rotation.z];
}

/** Ставит spot light на preset-позицию вокруг текущего target (как камера вокруг orbitTarget). */
export function buildSpotLightPositionPresetPatch(
  light: Light,
  preset: StandardCameraPresetId
): LightPatch {
  const focus = light.target;
  const distance =
    cameraOrbitDistance(light.transform.position, focus) || 5;
  const [ox, oy, oz] = POSITION_OFFSETS[preset];
  const position: [number, number, number] = [
    focus[0] + ox * distance,
    focus[1] + oy * distance,
    focus[2] + oz * distance,
  ];

  return {
    transform: {
      position,
      rotation: rotationFromLookAt(position, focus),
    },
    target: focus,
  };
}
