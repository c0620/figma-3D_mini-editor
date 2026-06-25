import type { SceneObject } from "../types/scene";
import type { SceneStorage } from "../store/sceneStorage";
import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";

export type ObjectGraphToolsSetPayload = {
  /** Если не указан — берётся текущее выделение (activeObjectId). */
  objectId?: string | null;
  visible?: boolean;
  locked?: boolean;
};

function resolveMeshObjectId(
  scene: SceneStorage,
  explicit?: string | null
): string | null {
  const id =
    typeof explicit === "string" && explicit.length > 0
      ? explicit
      : scene.getActiveObjectRef()?.id;
  return id ?? null;
}

/**
 * Видимость и блокировка узлов дерева объектов сцены (мешей) в доменном стораже.
 *
 * Для записи через CommandBus см. также {@link ToggleVisibilityHandler} /
 * {@link ToggleLockHandler} (payload `{ id: string }` — история undo/redo).
 */
export class ObjectGraphToolsHandler extends SceneToolHandler<
  ObjectGraphToolsSetPayload,
  ObjectGraphToolsSetPayload
> {
  execute(payload: ObjectGraphToolsSetPayload): void {
    const { objectId: explicitObjectId, visible, locked } = payload;

    const hasVisibility = typeof visible === "boolean";
    const hasLock = typeof locked === "boolean";
    if (!hasVisibility && !hasLock) return;

    const resolvedId = resolveMeshObjectId(this.scene, explicitObjectId);
    if (!resolvedId) return;

    const obj = this.scene.findObjectById(resolvedId);
    if (!obj) return;

    const patch: Partial<Pick<SceneObject, "visible" | "locked">> = {};
    if (hasVisibility) patch.visible = visible;
    if (hasLock) patch.locked = locked;

    this.scene.patchObject(resolvedId, patch);
  }

  getStateBeforeExecute(
    payload: ObjectGraphToolsSetPayload
  ): HistoryEntry<ObjectGraphToolsSetPayload> {
    const resolvedId = resolveMeshObjectId(this.scene, payload.objectId);
    if (!resolvedId)
      throw new Error(
        "getStateBeforeExecute(objectGraphToolsHandler): no object id"
      );

    const obj = this.scene.findObjectById(resolvedId);
    if (!obj)
      throw new Error(
        "getStateBeforeExecute(objectGraphToolsHandler): object not found"
      );

    return {
      type: CommandType.ToggleVisibility,
      snapshot: {
        objectId: resolvedId,
        visible: obj.visible,
        locked: obj.locked,
      },
    };
  }
}

export type ToggleVisibilityPayload = { id?: string };

export type ToggleVisibilitySnapshot = { id: string; visible: boolean };

/** Инвертирует `visible` для меша (история: ToggleVisibility). */
export class ToggleVisibilityHandler extends SceneToolHandler<
  ToggleVisibilityPayload,
  ToggleVisibilitySnapshot
> {
  execute(payload: ToggleVisibilityPayload): void {
    const id =
      typeof payload.id === "string"
        ? payload.id
        : resolveMeshObjectId(this.scene);
    if (!id) return;

    const obj = this.scene.findObjectById(id);
    if (!obj) return;

    this.scene.patchObject(id, { visible: !obj.visible });
  }

  getStateBeforeExecute(
    payload: ToggleVisibilityPayload
  ): HistoryEntry<ToggleVisibilitySnapshot> {
    const id =
      typeof payload.id === "string"
        ? payload.id
        : resolveMeshObjectId(this.scene);
    if (!id)
      throw new Error(
        "getStateBeforeExecute(toggleVisibilityHandler): no object id"
      );

    const obj = this.scene.findObjectById(id);
    if (!obj)
      throw new Error(
        "getStateBeforeExecute(toggleVisibilityHandler): object not found"
      );

    return {
      type: CommandType.ToggleVisibility,
      snapshot: { id, visible: obj.visible },
    };
  }
}

export type ToggleLockPayload = { id?: string };

export type ToggleLockSnapshot = { id: string; locked: boolean };

/** Инвертирует `locked` для меша (история: ToggleLock). */
export class ToggleLockHandler extends SceneToolHandler<
  ToggleLockPayload,
  ToggleLockSnapshot
> {
  execute(payload: ToggleLockPayload): void {
    const id =
      typeof payload.id === "string"
        ? payload.id
        : resolveMeshObjectId(this.scene);
    if (!id) return;

    const obj = this.scene.findObjectById(id);
    if (!obj) return;

    this.scene.patchObject(id, { locked: !obj.locked });
  }

  getStateBeforeExecute(
    payload: ToggleLockPayload
  ): HistoryEntry<ToggleLockSnapshot> {
    const id =
      typeof payload.id === "string"
        ? payload.id
        : resolveMeshObjectId(this.scene);
    if (!id)
      throw new Error("getStateBeforeExecute(toggleLockHandler): no object id");

    const obj = this.scene.findObjectById(id);
    if (!obj)
      throw new Error(
        "getStateBeforeExecute(toggleLockHandler): object not found"
      );

    return {
      type: CommandType.ToggleLock,
      snapshot: { id, locked: obj.locked },
    };
  }
}
