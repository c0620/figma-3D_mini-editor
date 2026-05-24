import {
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";

import {
  buildMeshStandardMaterialFromDomain,
  disposeMeshStandardMaterial,
} from "../render/domainMaterialBuilder";
import type { Material } from "../types/scene";

export interface MaterialPreviewOptions {
  size?: number;
  /** data:image/png;base64,... */
  format?: "dataUrl" | "blob";
  /** false — всегда пересчитывать */
  useCache?: boolean;
}

export function materialPreviewCacheKey(material: Material): string {
  return JSON.stringify({
    id: material.id,
    baseColor: material.baseColor,
    roughness: material.roughness,
    metalness: material.metalness,
    emissive: material.emissive,
    emissiveIntensity: material.emissiveIntensity,
    textures: material.textures,
  });
}

/**
 * Offscreen-превью материала на сфере.
 *
 * Свой WebGLRenderer + Scene + Camera — не связаны с R3F Canvas и threeAssetRegistry,
 * основная сцена не затрагивается.
 */
export class MaterialPreviewService {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
  private readonly size: number;
  private readonly cache = new Map<string, string | Blob>();
  private renderQueue: Promise<void> = Promise.resolve();

  constructor(size = 128) {
    this.size = size;

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(size, size);
    this.renderer.setPixelRatio(1);

    this.scene = new Scene();

    this.camera = new PerspectiveCamera(35, 1, 0.1, 20);
    this.camera.position.set(0, 2, 2.4);
    this.camera.lookAt(0, 0, 0);

    const geometry = new SphereGeometry(0.85, 48, 48);
    this.mesh = new Mesh(
      geometry,
      new MeshStandardMaterial({ color: 0xcccccc })
    );
    this.scene.add(this.mesh);

    this.scene.add(new AmbientLight(0xffffff, 0.45));
    const key = new DirectionalLight(0xffffff, 1.1);
    key.position.set(2.5, 2, 3);
    this.scene.add(key);
    const fill = new DirectionalLight(0xffffff, 0.35);
    fill.position.set(-2, -1, 1);
    this.scene.add(fill);
  }

  async renderMaterial(
    material: Material,
    options: MaterialPreviewOptions = {}
  ): Promise<string | Blob> {
    const format = options.format ?? "dataUrl";
    const useCache = options.useCache ?? true;
    const cacheKey = `${format}:${materialPreviewCacheKey(material)}`;

    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    let result!: string | Blob;
    this.renderQueue = this.renderQueue.then(async () => {
      result = await this.renderMaterialUncached(material, format);
      if (useCache) this.cache.set(cacheKey, result);
    });
    await this.renderQueue;
    return result;
  }

  private async renderMaterialUncached(
    material: Material,
    format: "dataUrl" | "blob"
  ): Promise<string | Blob> {
    const prev = this.mesh.material;
    const threeMat = await buildMeshStandardMaterialFromDomain(material);
    this.mesh.material = threeMat;
    if (prev !== threeMat) disposeMeshStandardMaterial(prev);

    this.renderer.render(this.scene, this.camera);

    const canvas = this.renderer.domElement;
    if (format === "blob") {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
          "image/png"
        );
      });
    }
    return canvas.toDataURL("image/png");
  }

  clearCache(): void {
    this.cache.clear();
  }

  dispose(): void {
    this.clearCache();
    disposeMeshStandardMaterial(this.mesh.material);
    this.mesh.geometry.dispose();
    this.renderer.dispose();
  }
}
