import type { ObjectID, SceneObjectKind } from "@/types/scene";
import { SceneToolHandler } from "./sceneToolHandler";
import { CommandType, type HistoryEntry } from "@/types/commands";

export interface DeletionHandlerPayload {
  id: ObjectID;
  isDelete: boolean;
  kind: SceneObjectKind;
}

export interface DeletionHandlerSnapshot extends DeletionHandlerPayload {}

export class DeletionHandler extends SceneToolHandler<
  DeletionHandlerPayload,
  DeletionHandlerSnapshot
> {
  execute(payload: DeletionHandlerPayload): void {
    const { id, isDelete, kind } = payload;
    if (isDelete) this.softDelete(id);
    else this.restore(id, kind);
  }

  softDelete(id: ObjectID): void {
    const object = this.scene.findObjectById(id);
    if (!object)
      throw new Error("softDelete(DeletionHandler): no object to delete");
    this.scene.softDeleteObject(object);
  }

  restore(id: ObjectID, kind: DeletionHandlerPayload["kind"]): void {
    switch (kind) {
      case "Light":
      case "Mesh":
      case "Group":
        this.scene.patchObject(id, {
          pendingDelete: false,
          visible: true,
        });
        break;
      case "Camera":
        this.scene.patchObject(id, { pendingDelete: false });
    }
  }

  getStateBeforeExecute(
    payload: DeletionHandlerPayload
  ): HistoryEntry<DeletionHandlerSnapshot> {
    const { id, isDelete, kind } = payload;
    return {
      type: CommandType.DeleteObject,
      snapshot: { id, isDelete: !isDelete, kind },
    };
  }
}
