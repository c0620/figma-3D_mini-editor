import type { SceneLight } from "../types/scene";
import { randomUUID } from "../lib/randomId";
import { CommandType, type HistoryEntry } from "@/types/commands";

import { SceneToolHandler } from "./sceneToolHandler";
import type {
  DeletionHandler,
  DeletionHandlerPayload,
} from "./deletionHandler";

type LightAdditionHandlerPayload = Partial<Omit<SceneLight, "id">> &
  Pick<SceneLight, "id">;
type LightAdditionHandlerSnapsot = DeletionHandlerPayload;

export class LightAdditionHandler extends SceneToolHandler<
  LightAdditionHandlerPayload,
  LightAdditionHandlerSnapsot
> {
  execute(payload: LightAdditionHandlerPayload): void {
    const incoming = payload;
    const light: SceneLight = {
      id: incoming.id,
      type: incoming.type ?? "Ambient",
      color: incoming.color ?? "#ffffff",
      intensity: incoming.intensity ?? 1,
      visible: incoming.visible ?? true,
      locked: incoming.locked ?? false,
      kind: "Light",
      pendingDelete: false,
      parentId: null,
      name: `Light${Object.values(this.scene.getScene().lights).filter((o) => o.kind == "Light").length}`,
      transform: incoming.transform ?? {
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    };

    this.scene.addObject(light);
  }

  getStateBeforeExecute(
    payload: LightAdditionHandlerPayload
  ): HistoryEntry<LightAdditionHandlerSnapsot> {
    const { id } = payload;
    return {
      type: CommandType.DeleteObject,
      snapshot: { id, isDelete: true, kind: "Light" },
    };
  }
}
