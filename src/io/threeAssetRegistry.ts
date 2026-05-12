import type { BufferGeometry, Material } from 'three';

interface ThreeAsset {
  geometry: BufferGeometry;
  material: Material | Material[];
}

/**
 * Пул живых Three.js-объектов (геометрия, материал, текстуры).
 * Не в Zustand — это мутабельные GPU-ресурсы, реактивность для них не нужна
 * и она ломает поведение Three.js.
 *
 * Связь со сценой: SceneObject.id (в Zustand-сторе) ↔ ключ в этом регистре.
 */
class ThreeAssetRegistry {
  private assets = new Map<string, ThreeAsset>();

  register(id: string, asset: ThreeAsset): void {
    const existing = this.assets.get(id);
    if (existing) this.disposeAsset(existing);
    this.assets.set(id, asset);
  }

  get(id: string): ThreeAsset | undefined {
    return this.assets.get(id);
  }

  delete(id: string): void {
    const asset = this.assets.get(id);
    if (!asset) return;
    this.disposeAsset(asset);
    this.assets.delete(id);
  }

  clear(): void {
    for (const asset of this.assets.values()) this.disposeAsset(asset);
    this.assets.clear();
  }

  private disposeAsset(asset: ThreeAsset): void {
    asset.geometry.dispose();
    if (Array.isArray(asset.material)) {
      asset.material.forEach((m) => m.dispose());
    } else {
      asset.material.dispose();
    }
  }
}

export const threeAssetRegistry = new ThreeAssetRegistry();
