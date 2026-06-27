import type { Material, MaterialID } from "@/types/scene";
import { SceneToolHandler } from "./sceneToolHandler";
import { CommandType, type HistoryEntry } from "@/types/commands";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";

export type MaterialEditingPayload = Partial<Omit<Material, "id">> &
  Pick<Material, "id">;

export class MaterialEditingHandler extends SceneToolHandler<MaterialEditingPayload> {
  execute(payload: MaterialEditingPayload): void {
    const { id, ...patch } = payload;
    this.scene.patchMaterial(id, patch);
  }
  getStateBeforeExecute(
    payload: MaterialEditingPayload
  ): HistoryEntry<MaterialEditingPayload> {
    const material = this.scene.getMaterial(payload.id);
    return {
      type: CommandType.EditMaterial,
      snapshot: { id: payload.id, ...material },
    };
  }
}
