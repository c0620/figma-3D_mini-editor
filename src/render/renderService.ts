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

  exportRender(options: RenderOptions): RenderResult {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const result = this.renderer.renderScene(canvas, this.scene.getScene(), options);
    this.progressListeners.forEach((l) => l(100));
    return result;
  }

  onProgress(listener: (percent: number) => void): void {
    this.progressListeners.push(listener);
  }
}
