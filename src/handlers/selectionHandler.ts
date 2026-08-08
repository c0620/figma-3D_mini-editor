import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";
import type { ObjectRef } from "@/types/scene";

type SelectionHandlerPayload = ObjectRef | null;

export class SelectionHandler extends SceneToolHandler<
  SelectionHandlerPayload,
  SelectionHandlerPayload
> {
  execute(payload: SelectionHandlerPayload): void {
    if (!payload) {
      this.scene.setActiveObjectRef(null);
      return;
    }

    const { id, kind } = payload!;
    const found = this.scene.findObjectById(id);
    if (!found || found.kind !== kind) return;
    this.scene.setActiveObjectRef({ id: found.id, kind: found.kind });
  }

  getStateBeforeExecute(
    _payload: SelectionHandlerPayload
  ): HistoryEntry<SelectionHandlerPayload | null> {
    const ref = this.scene.getActiveObjectRef();
    return {
      type: CommandType.SelectObject,
      snapshot: ref,
    };
  }
}
