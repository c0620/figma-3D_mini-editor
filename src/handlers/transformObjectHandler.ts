import type { ObjectRef, Transform } from "../types/scene";
import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";

export interface TransformObjectHandlerPayload extends Partial<Transform> {
  objectRef: ObjectRef;
}

/**
 * Устанавливает position / rotation / scale для активного объекта
 * (SceneObject, Light или Camera). Работает через иммутабельный патч стора.
 */
export class TransformObjectHandler extends SceneToolHandler<
  TransformObjectHandlerPayload,
  TransformObjectHandlerPayload
> {
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

  getStateBeforeExecute(
    payload: TransformObjectHandlerPayload
  ): HistoryEntry<TransformObjectHandlerPayload> {
    const { objectRef } = payload;
    if (!objectRef)
      throw new Error(
        "getStateBeforeExecute(transformObjectHandler): no id to revert"
      );

    if (objectRef.kind === "Camera") {
      const camera = this.scene.findCameraById(objectRef.id);
      if (!camera)
        throw new Error(
          "getStateBeforeExecute(transformObjectHandler): camera not found"
        );
      return {
        type: CommandType.TransformObject,
        snapshot: { objectRef, ...camera.transform },
      };
    }

    const obj = this.scene.findObjectById(objectRef.id);
    if (!obj)
      throw new Error(
        "getStateBeforeExecute(transformObjectHandler): object not found"
      );

    return {
      type: CommandType.TransformObject,
      snapshot: { objectRef, ...obj.transform },
    };
  }
}
