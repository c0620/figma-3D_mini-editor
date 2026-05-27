import type { Scene } from "../types/scene";
import type { RenderOptions, RenderResult } from "../types/render";
import {
  buildThreeSceneFromDomain,
  createRenderCameraFromDomainState,
} from "./domainSceneBuilder";
import { Color, WebGLRenderer } from "three";

export class Renderer {
  async renderScene(
    canvas: HTMLCanvasElement,
    scene: Scene,
    options: RenderOptions
  ): Promise<RenderResult> {
    const startedAt = performance.now();
    const built = await buildThreeSceneFromDomain(scene, {
      includeCamera: false,
    });

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(options.width, options.height, false);
    renderer.setPixelRatio(1);

    if (options.transparentBackground) {
      renderer.setClearColor(0x000000, 0);
      built.root.background = null;
    } else if (!built.root.background && scene.environment.backgroundColor) {
      built.root.background = new Color(scene.environment.backgroundColor);
    } else if (!built.root.background) {
      renderer.setClearColor(0x111111, 1);
    }

    const camera = createRenderCameraFromDomainState(
      scene.camera,
      options.width,
      options.height
    );

    try {
      renderer.render(built.root, camera);

      const png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
          "image/png"
        );
      });

      return { png, durationMs: performance.now() - startedAt };
    } finally {
      built.dispose();
      renderer.dispose();
    }
  }

  renderTexture(canvas: HTMLCanvasElement, textureId: string): Blob {
    void canvas;
    void textureId;
    return new Blob();
  }
}
