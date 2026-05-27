import type { RenderOptions, RenderResult } from '../types/render';
import { SceneStorage } from '../store/sceneStorage';
import { Renderer } from './renderer';

export class RenderService {
  renderer: Renderer;
  scene: SceneStorage;

  private progressListeners: Array<(percent: number) => void> = [];

  constructor(renderer: Renderer, scene: SceneStorage) {
    this.renderer = renderer;
    this.scene = scene;
  }

  async exportRender(options: RenderOptions): Promise<RenderResult> {
    const scene = this.scene.getScene();
    if (!scene) {
      return { png: new Blob(), durationMs: 0 };
    }

    const canvas = document.createElement("canvas");
    canvas.width = options.width;
    canvas.height = options.height;
    const result = await this.renderer.renderScene(canvas, scene, options);
    this.progressListeners.forEach((l) => l(100));
    return result;
  }

  onProgress(listener: (percent: number) => void): void {
    this.progressListeners.push(listener);
  }
}
