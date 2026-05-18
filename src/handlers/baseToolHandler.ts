import type { Transform } from '../types/scene';
import { isSceneCameraEntityId } from '../store/sceneEntityList';
import { useUiStore } from '../store/uiStore';
import { SceneToolHandler } from './sceneToolHandler';

export interface BaseToolPayload {
  id?: string | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
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

    const id = explicitId ?? useUiStore.getState().activeObjectId;
    if (!id) return;

    const transformPatch = this.buildTransformPatch({
      position,
      rotation,
      scale,
    });
    if (Object.keys(transformPatch).length === 0) return;

    const sceneId = this.scene.getScene().id;

    if (isSceneCameraEntityId(sceneId, id)) {
      this.scene.patchCamera({ transform: transformPatch });
      return;
    }

    const light = this.scene.findLightById(id);
    if (light) {
      this.scene.patchLight(id, { transform: transformPatch });
      return;
    }

    const obj = this.scene.findObjectById(id);
    if (!obj) return;

    this.scene.patchSceneObject(id, { transform: transformPatch });
  }

  private buildTransformPatch(parts: Partial<Transform>): Partial<Transform> {
    const out: Partial<Transform> = {};
    if (parts.position !== undefined) out.position = parts.position;
    if (parts.rotation !== undefined) out.rotation = parts.rotation;
    if (parts.scale !== undefined) out.scale = parts.scale;
    return out;
  }
}
