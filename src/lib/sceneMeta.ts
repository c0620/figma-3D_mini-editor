import { Mesh } from "three";

import { buildThreeSceneFromDomain } from "@/render/domainSceneBuilder";
import { TextureSlot, type Scene } from "@/types/scene";

export type SceneStatsSummary = {
  polygonCount: number;
  dimensions: string;
  textureCount: number;
};

export function formatTextureCountRu(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} текстура`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} текстуры`;
  }
  return `${count} текстур`;
}

export function countSceneTextures(scene: Scene): number {
  const textureUrls = new Set<string>();
  for (const material of Object.values(scene.materials)) {
    for (const slot of Object.values(TextureSlot)) {
      const tex = material.textures[slot];
      if (tex?.url) textureUrls.add(tex.url);
    }
  }
  return textureUrls.size;
}

export function formatSceneDimensions(scene: Scene): string {
  if (!scene.meshes.length) return "—";

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (const mesh of scene.meshes) {
    const [x, y, z] = mesh.transform.position;
    const [sx, sy, sz] = mesh.transform.scale;
    minX = Math.min(minX, x - sx / 2);
    minY = Math.min(minY, y - sy / 2);
    minZ = Math.min(minZ, z - sz / 2);
    maxX = Math.max(maxX, x + sx / 2);
    maxY = Math.max(maxY, y + sy / 2);
    maxZ = Math.max(maxZ, z + sz / 2);
  }

  const w = Math.max(1, Math.round(maxX - minX));
  const h = Math.max(1, Math.round(maxY - minY));
  const d = Math.max(1, Math.round(maxZ - minZ));
  return `${w}×${h}×${d}`;
}

export async function countScenePolygons(scene: Scene): Promise<number> {
  let count = 0;
  const built = await buildThreeSceneFromDomain(scene, {
    includeCamera: false,
  });
  try {
    built.root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      const geometry = obj.geometry;
      if (!geometry) return;
      if (geometry.index) {
        count += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        count += geometry.attributes.position.count / 3;
      }
    });
  } finally {
    built.dispose();
  }

  return Math.round(count) || scene.meshes.length;
}

export async function computeSceneStatsSummary(
  scene: Scene
): Promise<SceneStatsSummary> {
  const polygonCount = await countScenePolygons(scene);
  return {
    polygonCount,
    dimensions: formatSceneDimensions(scene),
    textureCount: countSceneTextures(scene),
  };
}
