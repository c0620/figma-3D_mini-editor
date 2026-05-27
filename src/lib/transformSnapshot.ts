import type { TransformObjectInversePayload } from "@/handlers/baseToolHandler";
import { isSceneCameraEntityId } from "@/store/sceneEntityList";
import { useSceneStore } from "@/store/sceneStore";
import type { Scene } from "@/types/scene";
import type { SceneStorage } from "@/store/sceneStorage";

function snapshotFromScene(
  scene: Scene,
  entityId: string
): TransformObjectInversePayload | null {
  if (isSceneCameraEntityId(scene.id, entityId)) {
    const camera = scene.camera;
    return {
      id: entityId,
      position: [...camera.transform.position],
      rotation: [...camera.transform.rotation],
      scale: [...camera.transform.scale],
      orbitTarget: [...camera.orbitTarget],
    };
  }

  const light = scene.lights.find((l) => l.id === entityId);
  if (light) {
    const snapshot: TransformObjectInversePayload = {
      id: entityId,
      position: [...light.transform.position],
      rotation: [...light.transform.rotation],
      scale: [...light.transform.scale],
    };
    if (light.type === "Spot") {
      snapshot.target = [...light.target];
    }
    return snapshot;
  }

  const mesh = scene.meshes.find((m) => m.id === entityId);
  if (!mesh) return null;

  return {
    id: entityId,
    position: [...mesh.transform.position],
    rotation: [...mesh.transform.rotation],
    scale: [...mesh.transform.scale],
  };
}

export function captureTransformSnapshotFromStore(
  entityId: string
): TransformObjectInversePayload | null {
  const scene = useSceneStore.getState().scene;
  if (!scene) return null;
  return snapshotFromScene(scene, entityId);
}

export function captureTransformSnapshot(
  scene: SceneStorage,
  entityId: string
): TransformObjectInversePayload | null {
  return snapshotFromScene(scene.getScene(), entityId);
}

function tupleEqual(
  a: [number, number, number],
  b: [number, number, number],
  epsilon = 1e-6
): boolean {
  return (
    Math.abs(a[0] - b[0]) <= epsilon &&
    Math.abs(a[1] - b[1]) <= epsilon &&
    Math.abs(a[2] - b[2]) <= epsilon
  );
}

export function transformSnapshotsEqual(
  a: TransformObjectInversePayload,
  b: TransformObjectInversePayload
): boolean {
  if (a.id !== b.id) return false;
  if (!tupleEqual(a.position, b.position)) return false;
  if (!tupleEqual(a.rotation, b.rotation)) return false;
  if (!tupleEqual(a.scale, b.scale)) return false;
  if (a.target && b.target && !tupleEqual(a.target, b.target)) return false;
  if (a.orbitTarget && b.orbitTarget && !tupleEqual(a.orbitTarget, b.orbitTarget)) {
    return false;
  }
  if (Boolean(a.target) !== Boolean(b.target)) return false;
  if (Boolean(a.orbitTarget) !== Boolean(b.orbitTarget)) return false;
  return true;
}

export function forwardPayloadFromSnapshot(
  snapshot: TransformObjectInversePayload
): {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
} {
  return {
    id: snapshot.id,
    position: [...snapshot.position],
    rotation: [...snapshot.rotation],
    scale: [...snapshot.scale],
  };
}
