import { TextureSlot } from "../types/scene";
import { SceneToolHandler } from "./sceneToolHandler";

export class TextureImportHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { materialId, slot, url } = payload as {
      materialId: string;
      slot: TextureSlot;
      url: string;
    };
    const obj = this.scene
      .getScene()
      .objects.find((o) => o.materialId === materialId);
    // if (obj) obj.material.textures.set(slot, url);
  }
}
