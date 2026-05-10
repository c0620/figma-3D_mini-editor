import type { Scene } from '../types/scene';
import type { RenderOptions, RenderResult } from '../types/render';

export class Renderer {
  renderScene(
    canvas: HTMLCanvasElement,
    scene: Scene,
    options: RenderOptions,
  ): RenderResult {
    void canvas;
    void scene;
    void options;
    return { png: new Blob(), durationMs: 0 };
  }

  renderTexture(canvas: HTMLCanvasElement, textureId: string): Blob {
    void canvas;
    void textureId;
    return new Blob();
  }
}
