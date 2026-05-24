import {
  Color,
  MeshStandardMaterial,
  TextureLoader,
  type Texture,
} from "three";

import { applyStoredTextureSettings } from "../io/materialTextureExtractor";
import type { Material, StoredTexture } from "../types/scene";
import { TextureSlot } from "../types/scene";

const textureLoader = new TextureLoader();

async function loadStoredTexture(
  stored: StoredTexture | null
): Promise<Texture | null> {
  if (!stored?.url) return null;
  try {
    const texture = await textureLoader.loadAsync(stored.url);
    applyStoredTextureSettings(texture, stored);
    return texture;
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

  return new MeshStandardMaterial({
    color: material.baseColor,
    roughness: material.roughness,
    metalness: material.metalness,
    emissive: new Color(material.emissive),
    map: map ?? undefined,
    normalMap: normalMap ?? undefined,
    roughnessMap: roughnessMap ?? undefined,
    metalnessMap: metalnessMap ?? undefined,
    emissiveMap: emissiveMap ?? undefined,
    name: material.name,
  });
}

export function disposeMeshStandardMaterial(
  material: MeshStandardMaterial
): void {
  material.map?.dispose();
  material.normalMap?.dispose();
  material.roughnessMap?.dispose();
  material.metalnessMap?.dispose();
  material.emissiveMap?.dispose();
  material.dispose();
}
