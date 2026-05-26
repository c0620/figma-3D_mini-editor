import type { SceneEntityKind } from "@/store/sceneEntityList";
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

    const obj = this.scene.findMeshById(resolvedId);
    if (!obj) return;

    const patch: Partial<Pick<SceneMesh, "visible" | "locked">> = {};
    if (hasVisibility) patch.visible = visible;
    if (hasLock) patch.locked = locked;

    this.scene.patchSceneMesh(resolvedId, patch);
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

    const obj = this.scene.findMeshById(id);
    if (obj) {
      this.scene.patchSceneMesh(id, { visible: !obj.visible });
      return;
    }

    const light = this.scene.findLightById(id);
    if (light) {
      this.scene.patchLight(id, { visible: !light.visible });
    }
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
    const payloadType = (payload as { type?: SceneEntityKind }).type;

    var obj;
    switch (payloadType) {
      case "mesh":
        obj = this.scene.findMeshById(id);
        if (!obj) throw new Error("ToggleLockHandler: no mesh with given id");
        this.scene.patchSceneMesh(id, { locked: !obj.locked });
        break;
      case "camera":
        obj = this.scene.getCamera();
        if (!obj) throw new Error("ToggleLockHandler: no camera state");
        this.scene.patchCamera({ locked: !obj.locked });
        break;
      case "light":
        obj = this.scene.findLightById(id);
        if (!obj) throw new Error("ToggleLockHandler: no light with given id");
        this.scene.patchLight(id, { locked: !obj.locked });
        break;
    }
  }
}
