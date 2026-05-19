import type { BufferGeometry, Material as ThreeMaterial } from "three";

export interface ThreeAsset {
  geometry: BufferGeometry;
  /** Клон материала с импорта (UV, flipY, карты уже настроены загрузчиком). */
  importedMaterial?: ThreeMaterial;
}

function disposeThreeMaterial(material: ThreeMaterial | undefined): void {
  if (!material) return;
  material.dispose();
}

/**
 * Пул геометрий и импортированных материалов Three.js.
 * Не в Zustand — мутабельные и тяжёлые.
 *
 * Скаляры материала и пользовательские текстуры — в `scene.materials`;
 * при замене текстуры из UI рендер переключается на URL из стора.
 *
 * Связь: SceneObject.id ↔ ключ в этом регистре.
 */
class ThreeAssetRegistry {
  private assets = new Map<string, ThreeAsset>();

  register(id: string, asset: ThreeAsset): void {
    const existing = this.assets.get(id);
    if (existing) {
      existing.geometry.dispose();
      disposeThreeMaterial(existing.importedMaterial);
    }
    this.assets.set(id, asset);
  }

  get(id: string): ThreeAsset | undefined {
    return this.assets.get(id);
  }

  delete(id: string): void {
    const asset = this.assets.get(id);
    if (!asset) return;
    asset.geometry.dispose();
    disposeThreeMaterial(asset.importedMaterial);
    this.assets.delete(id);
  }

  clear(): void {
    for (const asset of this.assets.values()) {
      asset.geometry.dispose();
      disposeThreeMaterial(asset.importedMaterial);
    }
    this.assets.clear();
  }
}

export const threeAssetRegistry = new ThreeAssetRegistry();
