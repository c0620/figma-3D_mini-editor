import { TextureSlot } from "../types/scene";
import { defaultStoredTexture } from "../io/materialTextureExtractor";
import { textureGpuPool } from "../store/textureGpuPool";
import { SceneToolHandler } from "./sceneToolHandler";

export class TextureImportHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { materialId, slot, url } = payload as {
      materialId: string;
      slot: TextureSlot;
      url: string;
    };

    const scene = this.scene.getScene();
    const material = scene.materials[materialId];
    if (!material) return;

    const prevUrl = material.textures[slot]?.url;
    if (prevUrl) textureGpuPool.evict(prevUrl);

    this.scene.patchMaterial(materialId, {
      textures: { [slot]: defaultStoredTexture(url, slot) },
    });
  }
}
