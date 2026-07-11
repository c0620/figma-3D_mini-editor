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
    const { id, isDelete } = payload;
    if (isDelete) this.softDelete(id);
    else this.restore(id);
  }

  softDelete(id: ObjectID): void {
    this.scene.patchObject(id, {
      pendingDelete: true,
      visible: false,
    });
  }

  restore(id: ObjectID): void {
    this.scene.patchObject(id, {
      pendingDelete: false,
      visible: true,
    });
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
