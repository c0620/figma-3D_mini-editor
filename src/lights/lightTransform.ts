import { Euler, Vector3 } from "three";

import type { Light } from "../types/scene";
import type { Transform } from "../types/scene";

function spotTargetDistance(
  position: [number, number, number],
  target: [number, number, number]
): number {
  return (
    Math.hypot(
      target[0] - position[0],
      target[1] - position[1],
      target[2] - position[2]
    ) || 5
  );
}

export function computeSpotTargetFromRotation(
  position: [number, number, number],
  rotation: [number, number, number],
  currentTarget: [number, number, number]
): [number, number, number] {
  const dist = spotTargetDistance(position, currentTarget);
  const forward = new Vector3(0, 0, -1).applyEuler(
    new Euler(rotation[0], rotation[1], rotation[2], "XYZ")
  );
  return new Vector3(...position)
    .add(forward.multiplyScalar(dist))
    .toArray() as [number, number, number];
}

export function translateSpotTarget(
  target: [number, number, number],
  delta: [number, number, number]
): [number, number, number] {
  return [
    target[0] + delta[0],
    target[1] + delta[1],
    target[2] + delta[2],
  ];
}

export function spotTargetPatchForTransform(
  light: Light,
  transformPatch: Partial<Transform>
): { target?: [number, number, number] } {
  if (light.type !== "Spot") return {};

  const prev = light.transform;

  if (transformPatch.rotation !== undefined) {
    const position = transformPatch.position ?? prev.position;
    return {
      target: computeSpotTargetFromRotation(
        position,
        transformPatch.rotation,
        light.target
      ),
    };
  }

  if (transformPatch.position !== undefined) {
    const delta: [number, number, number] = [
      transformPatch.position[0] - prev.position[0],
      transformPatch.position[1] - prev.position[1],
      transformPatch.position[2] - prev.position[2],
    ];
    return { target: translateSpotTarget(light.target, delta) };
  }

  return {};
}
