import { TextureSlot } from '../types/scene';
import { SceneToolHandler } from './sceneToolHandler';

export class TextureImportHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { materialId, slot, url } = payload as {
      materialId: string;
      slot: TextureSlot;
      url: string;
    };

    const scene = this.scene.getScene();
    if (!scene.materials[materialId]) return;

    this.scene.patchMaterial(materialId, {
      textures: { [slot]: url },
    });
  }
}
