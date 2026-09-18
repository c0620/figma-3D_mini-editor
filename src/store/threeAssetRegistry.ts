import type {
  MaterialID,
  ObjectID,
  TextureSlot,
  ThreeAsset,
  ThreeAssetMaterial,
} from "@/types/scene";
import type {
  BufferGeometry,
  Material,
  MeshStandardMaterial,
  Object3D,
  Texture,
} from "three";

type MaterialParams<T> = Exclude<T, "uuid" | "version" | "isMaterial">;

type LinkCount = number;
type RegistryMaterial = {
  linkCount: LinkCount;
  material: MeshStandardMaterial;
};

/**
 * Пул живых Three.js-объектов (геометрия, материал, текстуры).
 * Не в Zustand — это мутабельные GPU-ресурсы, реактивность для них не нужна
 * и она ломает поведение Three.js.
 *
 * Связь со сценой: SceneObject.id (в Zustand-сторе) ↔ ключ в этом регистре.
 */
export class ThreeAssetRegistry {
  assets = new Map<string, ThreeAsset>();
  materials: Record<MaterialID, RegistryMaterial> = {};

  register(
    id: string,
    asset: { geometry: BufferGeometry; materials: MeshStandardMaterial }
  ): void {
    const existing = this.assets.get(id);
    if (existing) this.disposeAsset(existing);

    const assetMaterials: ThreeAssetMaterial[] = [];

    const mats = Array.isArray(asset.materials)
      ? asset.materials
      : [asset.materials];

    mats.forEach((m: MeshStandardMaterial) => {
      if (!(m.uuid in this.materials)) {
        this.materials[m.uuid] = { linkCount: 1, material: m };
      } else {
        this.materials[m.uuid].linkCount += 1;
      }
      assetMaterials.push(m.uuid);
    });

    this.assets.set(id, {
      geometry: asset.geometry,
      materials: assetMaterials,
    });
  }

  getAssetData(id: string): ThreeAsset | undefined {
    return this.assets.get(id);
  }

  // set<K extends keyof MaterialParams<Material>>(
  //   materialID: MaterialID,
  //   param: K,
  //   value: MaterialParams<MeshStandardMaterial>[K]
  // ) {
  //   this.materials[materialID][param] = value;
  // }

  setParam(id: MaterialID, params: Partial<Omit<MeshStandardMaterial, "id">>) {
    const material = this.materials[id].material;
    material.setValues(params);
    if (params.color) material.emissive.copy(params.color);
    if (params.emissiveIntensity && params.emissiveIntensity > 0)
      material.emissive.copy(material.color);
    material.needsUpdate = true;
  }

  setTexture(id: MaterialID, slot: TextureSlot, texture: Texture) {
    const material = this.materials[id].material;
    material[slot]?.dispose();
    material[slot] = texture;
    material.needsUpdate = true;
  }

  delete(id: ObjectID): void {
    const asset = this.assets.get(id);
    if (!asset) return;
    this.disposeAsset(asset);
    this.assets.delete(id);
  }

  clear(): void {
    for (const asset of this.assets.values()) this.disposeAsset(asset);
    this.assets.clear();
  }

  replace(
    assets: Map<string, ThreeAsset>,
    materials: Record<MaterialID, RegistryMaterial>
  ) {
    this.clear();
    this.assets = assets;
    this.materials = materials;
  }

  merge(
    assets: Map<string, ThreeAsset>,
    materials: Record<MaterialID, RegistryMaterial>
  ) {
    assets.forEach((val, key) => this.assets.set(key, val));
    for (const [key, incoming] of Object.entries(materials)) {
      const existing = this.materials[key];
      if (existing) existing.linkCount += incoming.linkCount;
      else this.materials[key] = incoming;
    }
  }

  private disposeAsset(asset: ThreeAsset): void {
    asset.geometry.dispose();
    asset.materials.forEach((m) => {
      const entry = this.materials[m];
      if (!entry) return;
      entry.linkCount -= 1;
      if (entry.linkCount <= 0) {
        entry.material.dispose();
        delete this.materials[m];
      }
    });
  }
}

export const threeAssetRegistry = new ThreeAssetRegistry();
