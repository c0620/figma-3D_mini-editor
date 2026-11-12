import { CameraType, type MaterialID, type SceneCamera } from "../types/scene";
import type { RenderOptions, RenderResult } from "../types/render";
import {
  AmbientLight,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  SphereGeometry,
  Scene as TScene,
  WebGLRenderer,
} from "three";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import { AppError, ErrorCode } from "@/services/alert/errors";
import type { RootState } from "@react-three/fiber";

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

  async renderScene(
    camera: SceneCamera,
    canvas: HTMLCanvasElement,
    options: RenderOptions,
    sceneGetter: RootState["get"]
  ): Promise<RenderResult> {
    const renderer = new WebGLRenderer({
      canvas,
      alpha: options.transparentBackground,
    });
    const scene = sceneGetter().scene;

    const threeCamera =
      camera.type == CameraType.Perspective
        ? new PerspectiveCamera()
        : new OrthographicCamera();

    const [positionX, positionY, positionZ] = camera.transform.position;
    const [targetX, targetY, targetZ] = camera.target;
    threeCamera.position.set(positionX, positionY, positionZ);
    threeCamera.lookAt(targetX, targetY, targetZ);

    const aspect = camera.aspect[0] / camera.aspect[1];
    if (threeCamera instanceof PerspectiveCamera) {
      threeCamera.aspect = aspect;
      threeCamera.near = camera.near;
      threeCamera.far = camera.far;
      threeCamera.fov = camera.fov;
      threeCamera.zoom = camera.zoom ?? 1;
    }
    if (threeCamera instanceof OrthographicCamera) {
      const halfH = options.height / 2;
      const halfW = halfH * aspect;
      threeCamera.zoom = camera.zoom ?? 1;
      threeCamera.near = camera.near;
      threeCamera.far = camera.far;
      threeCamera.left = -halfW;
      threeCamera.right = halfW;
      threeCamera.top = halfH;
      threeCamera.bottom = -halfH;
    }
    threeCamera.updateProjectionMatrix();
    renderer.setSize(options.width, options.height, false);

    renderer.render(scene, threeCamera);
    const resultBlob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((blob) =>
        blob
          ? resolve(blob)
          : reject(
              new AppError(ErrorCode.UnknownError, "failed to create PNG blob")
            )
      )
    );
    renderer.dispose();
    if (!resultBlob) {
      throw new AppError(
        ErrorCode.UnknownError,
        "Failed to generate PNG blob from canvas"
      );
    }
    return { png: resultBlob, durationMs: 0 };
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
