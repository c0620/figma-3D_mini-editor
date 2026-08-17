import type { SceneProperties } from '../types/render';
import { SceneStorage } from '../store/sceneStorage';

export class SceneAnalyzer {
  getSceneProperties(scene: SceneStorage): SceneProperties {
    void scene;
    return { polygonCount: 0, sizeBytes: 0, hasTextures: false };
  }

  getTexturePreview(scene: SceneStorage): HTMLCanvasElement[] {
    void scene;
    return [];
  }
}
