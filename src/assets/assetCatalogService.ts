import type { Asset } from '../types/assets';
import { SceneStorage } from '../store/sceneStorage';

export class AssetCatalogService {
  assets: Asset[] = [];
  private scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  listAssets(tags: string[]): Asset[] {
    if (tags.length === 0) return this.assets;
    return this.assets.filter((a) => tags.some((t) => a.tags.includes(t)));
  }

  loadAssetToScene(assetId: string): void {
    void assetId;
    void this.scene;
  }
}
