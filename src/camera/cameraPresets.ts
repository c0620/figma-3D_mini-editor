import { Object3D, Vector3 } from "three";

import type { CameraPatch } from "../store/sceneStore";
import type {
  CameraState,
  SavedCameraView,
  StandardCameraPresetId,
} from "../types/scene";
import { cameraOrbitDistance } from "../types/scene";

const STANDARD_OFFSETS: Record<
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

export const STANDARD_CAMERA_PRESETS: StandardCameraPresetId[] = [
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

export function buildStandardCameraPresetPatch(
  state: CameraState,
  preset: StandardCameraPresetId
): CameraPatch {
  const [tx, ty, tz] = state.orbitTarget;
  const distance = cameraOrbitDistance(
    state.transform.position,
    state.orbitTarget
  );
  const [ox, oy, oz] = STANDARD_OFFSETS[preset];
  const position: [number, number, number] = [
    tx + ox * distance,
    ty + oy * distance,
    tz + oz * distance,
  ];

  return {
    transform: {
      position,
      rotation: rotationFromLookAt(position, state.orbitTarget),
    },
    orbitTarget: state.orbitTarget,
  };
}

export function buildSaveCameraViewPatch(state: CameraState): CameraPatch {
  const savedView: SavedCameraView = {
    transform: {
      position: [...state.transform.position],
      rotation: [...state.transform.rotation],
      scale: [...state.transform.scale],
    },
    orbitTarget: [...state.orbitTarget],
    perspectiveZoom: state.perspectiveZoom,
    orthographicZoom: state.orthographicZoom,
  };

  return { savedView };
}

export function buildApplySavedCameraViewPatch(
  state: CameraState
): CameraPatch | null {
  if (!state.savedView) return null;

  const { transform, orbitTarget, perspectiveZoom, orthographicZoom } =
    state.savedView;

  return {
    transform: {
      position: [...transform.position],
      rotation: [...transform.rotation],
      scale: [...transform.scale],
    },
    orbitTarget: [...orbitTarget],
    perspectiveZoom,
    orthographicZoom,
  };
}
