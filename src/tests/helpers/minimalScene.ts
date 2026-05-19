import type { Scene } from "@/types/scene";
import { TextureSlot } from "@/types/scene";

const emptyTextures = (): Record<TextureSlot, string | null> => ({
  [TextureSlot.BaseColor]: null,
  [TextureSlot.Normal]: null,
  [TextureSlot.Roughness]: null,
  [TextureSlot.Metalness]: null,
  [TextureSlot.Emissive]: null,
});

/** Минимальная сцена с одним мешем и одним материалом — для интеграционных тестов. */
export function createMinimalScene(): Scene {
  return {
    id: "scene-test",
    objects: [
      {
        id: "mesh-1",
        name: "Cube",
        visible: true,
        locked: false,
        pendingDelete: false,
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
        materialId: "mat-1",
      },
    ],
    materials: {
      "mat-1": {
        id: "mat-1",
        baseColor: "#cccccc",
        roughness: 0.5,
        metalness: 0,
        emissive: "#000000",
        textures: emptyTextures(),
      },
    },
    lights: [],
    camera: {
      type: "Perspective",
      zoom: 1,
      locked: false,
      transform: {
        position: [0, 0, 5],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    },
    environment: { backgroundColor: null, shadowsEnabled: false },
  };
}
