import { useMemo } from "react";
import { use } from "react";
import type { Texture } from "three";

import { textureGpuPool } from "../../../store/textureGpuPool";
import type { Material } from "../../../types/scene";
import { TextureSlot } from "../../../types/scene";

export type MaterialGpuMaps = {
  map?: Texture;
  normalMap?: Texture;
  roughnessMap?: Texture;
  metalnessMap?: Texture;
  emissiveMap?: Texture;
};

async function loadMaterialGpuMaps(
  textures: Material["textures"]
): Promise<MaterialGpuMaps> {
  const loadSlot = async (stored: Material["textures"][TextureSlot]) => {
    if (!stored?.url) return undefined;
    return textureGpuPool.load(stored);
  };

  const [map, normalMap, roughnessMap, metalnessMap, emissiveMap] =
    await Promise.all([
      loadSlot(textures[TextureSlot.BaseColor]),
      loadSlot(textures[TextureSlot.Normal]),
      loadSlot(textures[TextureSlot.Roughness]),
      loadSlot(textures[TextureSlot.Metalness]),
      loadSlot(textures[TextureSlot.Emissive]),
    ]);

  return { map, normalMap, roughnessMap, metalnessMap, emissiveMap };
}

/** Lazy GPU-текстуры из pool; deps только на mat.textures (не scalars). */
export function useMaterialGpuTextures(
  textures: Material["textures"]
): MaterialGpuMaps {
  const texturesKey = useMemo(() => JSON.stringify(textures), [textures]);
  const mapsPromise = useMemo(
    () => loadMaterialGpuMaps(textures),
    [texturesKey]
  );
  return use(mapsPromise);
}
