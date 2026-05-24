import type { Material } from "@/types/scene";
import { SceneToolHandler } from "./sceneToolHandler";

type MaterialEdit = Partial<Material> & Pick<Material, "id">;

export class MaterialEditingHandler extends SceneToolHandler {
  execute(payload: MaterialEdit): void {
    const { id, changes } = payload as {
      id: string;
      changes: Partial<Material>;
    };
    this.scene.patchMaterial(id, changes);
  }
}
