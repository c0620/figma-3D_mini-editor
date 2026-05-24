import type { BufferGeometry, Material as ThreeMaterial } from "three";

export interface ThreeAsset {
  geometry: BufferGeometry;
  /** Клон материала с импорта (UV, flipY, карты уже настроены загрузчиком). */
  importedMaterials?: ThreeMaterial[];
}

function disposeThreeMaterial(material: ThreeMaterial | undefined): void {
  if (!material) return;
  material.dispose();
}

/**
 * Пул геометрий и импортированных материалов Three.js.
 * Не в Zustand — мутабельные и тяжёлые.
 *
 * Скаляры и URL текстур — в `scene.materials` (источник истины).
 * importedMaterials — fallback-рендер, если URL не удалось извлечь при импорте.
 *
 * Связь: SceneObject.id ↔ ключ в этом регистре.
 */
class ThreeAssetRegistry {
  private assets = new Map<string, ThreeAsset>();

  register(id: string, asset: ThreeAsset): void {
    const existing = this.assets.get(id);
    if (existing) {
      existing.geometry.dispose();
      existing.importedMaterials?.map((m) => disposeThreeMaterial(m));
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
    asset.importedMaterials?.map((m) => disposeThreeMaterial(m));
    this.assets.delete(id);
  }

  clear(): void {
    for (const asset of this.assets.values()) {
      asset.geometry.dispose();
      asset.importedMaterials?.map((m) => disposeThreeMaterial(m));
    }
    this.assets.clear();
  }
}

export const threeAssetRegistry = new ThreeAssetRegistry();
