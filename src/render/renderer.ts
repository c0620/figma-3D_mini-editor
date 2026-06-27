import type { MaterialID, Scene } from "../types/scene";
import type { RenderOptions, RenderResult } from "../types/render";
import {
  AmbientLight,
  Mesh,
  OrthographicCamera,
  PointLight,
  SphereGeometry,
  Scene as TScene,
  WebGLRenderer,
} from "three";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";

type PreviewState = {
  canvas: HTMLCanvasElement;
  renderer: WebGLRenderer;
  scene: TScene;
  camera: OrthographicCamera;
  mesh: Mesh;
  geometry: SphereGeometry;
};

export class Renderer {
  private previewState: PreviewState | null = null;

  renderScene(
    canvas: HTMLCanvasElement,
    scene: Scene,
    options: RenderOptions
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

  renderMaterialPreview(
    targetCanvas: HTMLCanvasElement,
    materialID: MaterialID
  ): void {
    const preview = this.getPreviewState();
    const size = targetCanvas.clientWidth || 64;

    preview.renderer.setSize(size, size, false);
    preview.mesh.material = threeAssetRegistry.materials[materialID].material;
    preview.renderer.render(preview.scene, preview.camera);

    targetCanvas.width = size;
    targetCanvas.height = size;
    targetCanvas.getContext("2d")?.drawImage(preview.canvas, 0, 0);
  }

  disposeMaterialPreview(): void {
    if (!this.previewState) return;
    const { geometry, renderer } = this.previewState;
    geometry.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    this.previewState = null;
  }

  private getPreviewState(): PreviewState {
    if (this.previewState) return this.previewState;

    const canvas = document.createElement("canvas");
    const scene = new TScene();
    scene.add(new AmbientLight(0xffffff, 1));
    const light = new PointLight(0xffffff, 5);
    light.position.set(1, 0, 0);
    scene.add(light);

    const geometry = new SphereGeometry(1, 32, 32);
    const mesh = new Mesh(geometry);
    scene.add(mesh);

    const camera = new OrthographicCamera(-1.2, 1.2, 1.2, -1.2, 0.1, 10);
    camera.position.set(0, 0, 3);

    const renderer = new WebGLRenderer({ canvas, alpha: true });

    this.previewState = { canvas, renderer, scene, camera, mesh, geometry };
    return this.previewState;
  }
}
