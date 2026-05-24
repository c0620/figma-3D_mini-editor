import { Color, MeshStandardMaterial, type Texture } from "three";

import { textureGpuPool } from "../store/textureGpuPool";
import type { Material, StoredTexture } from "../types/scene";
import { TextureSlot } from "../types/scene";

/** Без emissive-карты свечение берётся из baseColor при intensity > 0. */
export function resolveEmissiveForRender(material: Material): {
  color: string;
  intensity: number;
} {
  const hasEmissiveMap = material.textures[TextureSlot.Emissive]?.url != null;

  if (hasEmissiveMap) {
    return {
      color: material.emissive,
      intensity: material.emissiveIntensity,
    };
  }

  if (material.emissiveIntensity > 1) {
    return {
      color: material.baseColor,
      intensity: material.emissiveIntensity,
    };
  }

  return {
    color: material.emissive,
    intensity: material.emissiveIntensity,
  };
}

async function loadStoredTexture(
  stored: StoredTexture | null
): Promise<Texture | null> {
  if (!stored?.url) return null;
  try {
    return await textureGpuPool.load(stored);
  } catch {
    return null;
  }
}

/** Доменный Material → MeshStandardMaterial (для превью и offscreen-рендера). */
export async function buildMeshStandardMaterialFromDomain(
  material: Material
): Promise<MeshStandardMaterial> {
  const [map, normalMap, roughnessMap, metalnessMap, emissiveMap] =
    await Promise.all([
      loadStoredTexture(material.textures[TextureSlot.BaseColor]),
      loadStoredTexture(material.textures[TextureSlot.Normal]),
      loadStoredTexture(material.textures[TextureSlot.Roughness]),
      loadStoredTexture(material.textures[TextureSlot.Metalness]),
      loadStoredTexture(material.textures[TextureSlot.Emissive]),
    ]);

  const emissive = resolveEmissiveForRender(material);

  return new MeshStandardMaterial({
    color: material.baseColor,
    roughness: material.roughness,
    metalness: material.metalness,
    emissive: new Color(emissive.color),
    emissiveIntensity: emissive.intensity,
    map: map ?? undefined,
    normalMap: normalMap ?? undefined,
    roughnessMap: roughnessMap ?? undefined,
    metalnessMap: metalnessMap ?? undefined,
    emissiveMap: emissiveMap ?? undefined,
    name: material.name,
  });
}

export function disposeMeshStandardMaterial(
  material: MeshStandardMaterial,
  options?: { disposeTextures?: boolean }
): void {
  const disposeTextures = options?.disposeTextures ?? false;

  if (disposeTextures) {
    material.map?.dispose();
    material.normalMap?.dispose();
    material.roughnessMap?.dispose();
    material.metalnessMap?.dispose();
    material.emissiveMap?.dispose();
  }

  material.dispose();
}
