import type { BufferGeometry } from "three";

export interface ThreeAsset {
  geometry: BufferGeometry;
}

/**
 * Пул геометрий Three.js (не в Zustand — мутабельные и тяжёлые).
 * Материалы — только в `scene.materials`, viewport читает store.
 *
 * Связь: SceneMesh.id ↔ ключ в этом регистре.
 */
class ThreeAssetRegistry {
  private assets = new Map<string, ThreeAsset>();

  register(id: string, asset: ThreeAsset): void {
    const existing = this.assets.get(id);
    if (existing) {
      existing.geometry.dispose();
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
    this.assets.delete(id);
  }

  clear(): void {
    for (const asset of this.assets.values()) {
      asset.geometry.dispose();
    }
    this.assets.clear();
  }
}

export const threeAssetRegistry = new ThreeAssetRegistry();
