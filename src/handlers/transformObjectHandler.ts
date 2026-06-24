import type { ObjectRef, Transform } from "../types/scene";
import { SceneToolHandler } from "./sceneToolHandler";

export interface TransformObjectHandlerPayload {
  objectRef: ObjectRef;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/**
 * Устанавливает position / rotation / scale для активного объекта
 * (SceneObject, Light или Camera). Работает через иммутабельный патч стора.
 */
export class TransformObjectHandler extends SceneToolHandler {
  execute(payload: TransformObjectHandlerPayload): void {
    const { objectRef, position, rotation, scale } = payload;
    if (!objectRef) return;

    const transformPatch = this.buildTransformPatch({
      position,
      rotation,
      scale,
    });
    if (Object.keys(transformPatch).length === 0) return;

    switch (objectRef.kind) {
      case "Camera":
        this.scene.patchCamera({ transform: transformPatch });
        return;
      case "Environment":
        throw new Error("transformObjectHandler: Environment not impl");
      case "Light":
      case "Mesh":
      case "Group":
        this.scene.patchObject(objectRef.id, { transform: transformPatch });
    }
  }

  private buildTransformPatch(parts: Partial<Transform>): Partial<Transform> {
    const out: Partial<Transform> = {};
    if (parts.position !== undefined) out.position = parts.position;
    if (parts.rotation !== undefined) out.rotation = parts.rotation;
    if (parts.scale !== undefined) out.scale = parts.scale;
    return out;
  }

  getStateBeforeExecute(payload: TransformObjectHandlerPayload) {
    const { objectRef } = payload;
    if (!objectRef) return;

    return {
      id: objectRef.id,
      ...this.scene.findObjectById(objectRef.id)?.transform,
    };
  }
}
