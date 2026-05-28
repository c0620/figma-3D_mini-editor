import { Mesh } from "three";

import type { Asset, AssetTag } from "../types/assets";
import type { Scene } from "../types/scene";
import {
  importThreeObjectAsScene,
  importThreeObjectAsSceneAppend,
} from "../io/sceneEncoder";
import { SceneStorage } from "../store/sceneStorage";
import { useSceneStore } from "../store/sceneStore";
import { useSessionStore } from "../store/sessionStore";
import { remapSceneFragmentIds } from "../lib/sceneFragmentMerge";
import { LIBRARY_ASSETS } from "./assetCatalog";
import { createPrimitiveObject3D } from "./primitiveSceneFactory";

export class AssetCatalogService {
  readonly assets: Asset[] = LIBRARY_ASSETS;
  private scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  listAssets(tags: AssetTag[]): Asset[] {
    if (tags.length === 0) return this.assets;
    return this.assets.filter((a) => tags.some((t) => a.tags.includes(t)));
  }

  getAsset(assetId: string): Asset | undefined {
    return this.assets.find((a) => a.id === assetId);
  }

  private async buildSceneFragmentForAsset(
    assetId: string,
    meshName: string,
    append: boolean
  ): Promise<Scene> {
    const asset = this.getAsset(assetId);
    if (!asset) {
      throw new Error(`AssetCatalogService: unknown asset "${assetId}"`);
    }
    const root = createPrimitiveObject3D(asset.primitiveKind, meshName);
    try {
      const importScene = append
        ? importThreeObjectAsSceneAppend
        : importThreeObjectAsScene;
      return await importScene(root, { syncTextures: true });
    } finally {
      root.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry.dispose();
          const mat = child.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
    }
  }

  async buildSceneForAsset(assetId: string, meshName: string): Promise<Scene> {
    return this.buildSceneFragmentForAsset(assetId, meshName, false);
  }

  async loadAssetToScene(assetId: string, projectName: string): Promise<Scene> {
    const scene = await this.buildSceneForAsset(assetId, projectName);
    this.scene.load(scene);
    useSessionStore.getState().setProjectName(projectName);
    const meshId = scene.meshes[0]?.id;
    if (meshId) {
      useSessionStore.getState().setActiveObjectId(meshId);
    }
    return scene;
  }

  async appendAssetToScene(
    assetId: string,
    meshName: string
  ): Promise<string | null> {
    const current = useSceneStore.getState().scene;
    if (!current) {
      await this.loadAssetToScene(assetId, meshName);
      return useSessionStore.getState().activeObjectId;
    }

    const fragment = remapSceneFragmentIds(
      await this.buildSceneFragmentForAsset(assetId, meshName, true)
    );
    const meshId = fragment.meshes[0]?.id ?? null;

    useSceneStore.setState({
      scene: {
        ...current,
        meshes: [...current.meshes, ...fragment.meshes],
        materials: { ...current.materials, ...fragment.materials },
      },
    });

    if (meshId) {
      useSessionStore.getState().setActiveObjectId(meshId);
    }

    return meshId;
  }
}
