import type { SceneGraphObject } from "../types/scene";
import type { SceneStorage } from "../store/sceneStorage";
import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";

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
    if (!obj || obj.kind == "Camera")
      throw new Error(
        "getStateBeforeExecute(toggleVisibilityHandler): object not found / camera found"
      );

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
    if (!obj || obj.kind == "Camera")
      throw new Error(
        "getStateBeforeExecute(toggleVisibilityHandler): object not found / camera found"
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
