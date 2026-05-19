import type { BufferGeometry } from 'three';

interface ThreeAsset {
  geometry: BufferGeometry;
}

/**
 * Пул геометрий Three.js (GPU-буферы вершин).
 * Не в Zustand — мутабельные и тяжёлые; после импорта не меняются.
 *
 * Материалы и текстуры живут в `scene.materials` (Zustand) и
 * рендерятся декларативно через R3F (`meshStandardMaterial`).
 *
 * Связь: SceneObject.id ↔ ключ в этом регистре.
 */
class ThreeAssetRegistry {
  private assets = new Map<string, ThreeAsset>();

  register(id: string, asset: ThreeAsset): void {
    const existing = this.assets.get(id);
    if (existing) existing.geometry.dispose();
    this.assets.set(id, asset);
  }

  get(id: string): ThreeAsset | undefined {
    return this.assets.get(id);
  }

  delete(id: string): void {
    const asset = this.assets.get(id);
    if (!asset) return;
    asset.geometry.dispose();
    this.assets.delete(id);
  }

  clear(): void {
    for (const asset of this.assets.values()) asset.geometry.dispose();
    this.assets.clear();
  }
}

export const threeAssetRegistry = new ThreeAssetRegistry();
