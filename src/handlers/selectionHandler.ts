import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";

type SelectionHandlerPayload = { id: string | null };

export class SelectionHandler extends SceneToolHandler<
  SelectionHandlerPayload,
  SelectionHandlerPayload
> {
  execute(payload: SelectionHandlerPayload): void {
    const { id } = payload;
    const newObject = id ? this.scene.getScene().sceneGraph.objects[id] : null;
    const newRef = newObject
      ? { id: id as string, kind: newObject.kind }
      : null;
    this.scene.setActiveObjectId(newRef);
  }

  getStateBeforeExecute(
    _payload: SelectionHandlerPayload
  ): HistoryEntry<SelectionHandlerPayload> {
    const ref = this.scene.getActiveObjectRef();
    return {
      type: CommandType.SelectObject,
      snapshot: { id: ref?.id ?? null },
    };
  }
}
