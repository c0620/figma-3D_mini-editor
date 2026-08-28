import type { SceneLight } from "@/types/scene";
import { CommandType, type HistoryEntry } from "@/types/commands";
import type { LightPatch } from "../store/sceneStore";
import { SceneToolHandler } from "./sceneToolHandler";

export interface LightEditingPayload {
  id: string;
  changes: LightPatch;
}

export class LightEditingHandler extends SceneToolHandler<
  LightEditingPayload,
  LightEditingPayload
> {
  execute(payload: LightEditingPayload): void {
    const { id, changes } = payload;
    this.scene.patchObject(id, changes);
    if (changes.target && this.scene.getActiveObjectTool() === "rotate") {
      this.scene.setActiveObjectTool(null);
    }
  }

  getStateBeforeExecute(
    payload: LightEditingPayload
  ): HistoryEntry<LightEditingPayload> {
    const { id } = payload;
    const light = this.scene.findObjectById(id) as SceneLight | null;
    if (!light)
      throw new Error(
        "getStateBeforeExecute(lightEditingHandler): light not found"
      );

    return {
      type: CommandType.EditLight,
      snapshot: {
        id,
        changes: { ...light },
      },
    };
  }
}
