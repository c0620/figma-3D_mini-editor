import { Euler, Vector3 } from "three";
import type { Transform } from "../types/scene";
import { isSceneCameraEntityId } from "../store/sceneEntityList";
import { useSessionStore } from "../store/sessionStore";
import { SceneToolHandler } from "./sceneToolHandler";

export interface BaseToolPayload {
  id?: string | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

function computeOrbitTargetFromRotation(
  position: [number, number, number],
  currentTarget: [number, number, number],
  rotation: [number, number, number]
): [number, number, number] {
  const pos = new Vector3(...position);
  const target = new Vector3(...currentTarget);
  const distance = pos.distanceTo(target) || 5;
  const forward = new Vector3(0, 0, -1).applyEuler(
    new Euler(rotation[0], rotation[1], rotation[2], "XYZ")
  );
  return pos
    .clone()
    .add(forward.multiplyScalar(distance))
    .toArray() as [number, number, number];
}

/**
 * Устанавливает position / rotation / scale для активного объекта
 * (SceneObject, Light или Camera). Работает через иммутабельный патч стора.
 */
export class BaseToolHandler extends SceneToolHandler {
  execute(payload: object): void {
    const {
      id: explicitId,
      position,
      rotation,
      scale,
    } = payload as BaseToolPayload;

    const id = explicitId ?? useSessionStore.getState().activeObjectId;
    if (!id) return;

    const transformPatch = this.buildTransformPatch({
      position,
      rotation,
      scale,
    });
    if (Object.keys(transformPatch).length === 0) return;

    const sceneId = this.scene.getScene().id;

    if (isSceneCameraEntityId(sceneId, id)) {
      const cam = this.scene.getCamera();
      if (!cam) return;

      const nextPosition = transformPatch.position ?? cam.transform.position;
      const cameraPatch: {
        transform: Partial<Transform>;
        orbitTarget?: [number, number, number];
      } = { transform: transformPatch };

      if (transformPatch.rotation !== undefined) {
        cameraPatch.orbitTarget = computeOrbitTargetFromRotation(
          nextPosition,
          cam.orbitTarget,
          transformPatch.rotation
        );
      }

      this.scene.patchCamera(cameraPatch);
      return;
    }

    const light = this.scene.findLightById(id);
    if (light) {
      this.scene.patchLight(id, { transform: transformPatch });
      return;
    }

    const obj = this.scene.findMeshById(id);
    if (!obj) return;

    this.scene.patchSceneMesh(id, { transform: transformPatch });
  }

  private buildTransformPatch(parts: Partial<Transform>): Partial<Transform> {
    const out: Partial<Transform> = {};
    if (parts.position !== undefined) out.position = parts.position;
    if (parts.rotation !== undefined) out.rotation = parts.rotation;
    if (parts.scale !== undefined) out.scale = parts.scale;
    return out;
  }
}
