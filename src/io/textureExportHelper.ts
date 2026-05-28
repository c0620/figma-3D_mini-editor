import { downloadBlob, sanitizeExportBasename } from "../lib/download";
import type { Scene } from "../types/scene";
import { TextureSlot } from "../types/scene";

export const TEXTURE_SLOT_ORDER = [
  TextureSlot.BaseColor,
  TextureSlot.Normal,
  TextureSlot.Roughness,
  TextureSlot.Metalness,
  TextureSlot.Emissive,
] as const;

async function urlToBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

export async function downloadSceneTextures(
  scene: Scene,
  baseName: string
): Promise<void> {
  const seen = new Set<string>();

  for (const material of Object.values(scene.materials)) {
    const safeMaterialName = sanitizeExportBasename(
      material.name || material.id,
      material.id
    );

    for (const slot of TEXTURE_SLOT_ORDER) {
      const stored = material.textures[slot];
      if (!stored?.url || seen.has(stored.url)) continue;

      seen.add(stored.url);
      const blob = await urlToBlob(stored.url);
      if (!blob) continue;

      downloadBlob(blob, `${baseName}__${safeMaterialName}__${slot}.png`);
    }
  }
}
