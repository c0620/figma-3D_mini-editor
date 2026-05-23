import { useSessionStore } from "../store/sessionStore";
import type { SceneMesh } from "../types/scene";
import { SceneToolHandler } from "./sceneToolHandler";

export type ObjectGraphToolsSetPayload = {
  /** Если не указан — берётся текущее выделение (activeObjectId). */
  objectId?: string | null;
  visible?: boolean;
  locked?: boolean;
};

function resolveMeshObjectId(explicit?: string | null): string | null {
  const id =
    typeof explicit === "string" && explicit.length > 0
      ? explicit
      : useSessionStore.getState().activeObjectId;
  return id ?? null;
}

/**
 * Видимость и блокировка узлов дерева объектов сцены (мешей) в доменном стораже.
 *
 * Для записи через CommandBus см. также {@link ToggleVisibilityHandler} /
 * {@link ToggleLockHandler} (payload `{ id: string }` — история undo/redo).
 */
export class ObjectGraphToolsHandler extends SceneToolHandler {
  execute(payload: object): void {
    const {
      objectId: explicitObjectId,
      visible,
      locked,
    } = payload as ObjectGraphToolsSetPayload;

    const hasVisibility = typeof visible === "boolean";
    const hasLock = typeof locked === "boolean";
    if (!hasVisibility && !hasLock) return;

    const resolvedId = resolveMeshObjectId(explicitObjectId);
    if (!resolvedId) return;

    const obj = this.scene.findObjectById(resolvedId);
    if (!obj) return;

    const patch: Partial<Pick<SceneMesh, "visible" | "locked">> = {};
    if (hasVisibility) patch.visible = visible;
    if (hasLock) patch.locked = locked;

    this.scene.patchSceneObject(resolvedId, patch);
  }
}

/** Инвертирует `visible` для меша (история: ToggleVisibility). */
export class ToggleVisibilityHandler extends SceneToolHandler {
  execute(payload: object): void {
    const id =
      typeof (payload as { id?: string }).id === "string"
        ? (payload as { id: string }).id
        : resolveMeshObjectId();
    if (!id) return;

    const obj = this.scene.findObjectById(id);
    if (!obj) return;

    this.scene.patchSceneObject(id, { visible: !obj.visible });
  }
}

/** Инвертирует `locked` для меша (история: ToggleLock). */
export class ToggleLockHandler extends SceneToolHandler {
  execute(payload: object): void {
    const id =
      typeof (payload as { id?: string }).id === "string"
        ? (payload as { id: string }).id
        : resolveMeshObjectId();
    if (!id) return;

    const obj = this.scene.findObjectById(id);
    if (!obj) return;

    this.scene.patchSceneObject(id, { locked: !obj.locked });
  }
}
