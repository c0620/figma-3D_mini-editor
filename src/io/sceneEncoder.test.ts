import { BoxGeometry, type WebGLRenderer } from "three";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { SceneEncoder } from "./sceneEncoder";
import { createOffscreenRenderer } from "../render/createOffscreenRenderer";
import { buildThreeSceneFromDomain } from "../render/domainSceneBuilder";

vi.mock("../render/createOffscreenRenderer", () => ({
  createOffscreenRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    dispose: vi.fn(),
    initTexture: vi.fn(),
  })) as unknown as () => WebGLRenderer,
}));

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    putImageData: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import { withDefaultAmbientLight } from "../lights/lightDefaults";
import {
  DEFAULT_CAMERA_STATE,
  TextureSlot,
  type Material,
  type Scene,
  type SceneMesh,
} from "../types/scene";

function createTestScene(): Scene {
  const meshId = "mesh-test-1";
  const materialId = "mat-test-1";

  threeAssetRegistry.register(meshId, {
    geometry: new BoxGeometry(1, 1, 1),
  });

  const material: Material = {
    id: materialId,
    baseColor: "#ff5533",
    baseColorVariableId: null,
    roughness: 0.5,
    metalness: 0.1,
    emissive: "#000000",
    emissiveIntensity: 1,
    textures: {
      [TextureSlot.BaseColor]: null,
      [TextureSlot.Normal]: null,
      [TextureSlot.Roughness]: null,
      [TextureSlot.Metalness]: null,
      [TextureSlot.Emissive]: null,
    },
    name: "TestMaterial",
  };

  const mesh: SceneMesh = {
    id: meshId,
    name: "TestMesh",
    visible: true,
    locked: false,
    pendingDelete: false,
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    materialIDs: [materialId],
  };

  return {
    id: "scene-test-1",
    meshes: [mesh],
    materials: { [materialId]: material },
    lights: withDefaultAmbientLight([]),
    camera: { ...DEFAULT_CAMERA_STATE },
    environment: { backgroundColor: null, shadowsEnabled: false },
  };
}

describe("buildThreeSceneFromDomain", () => {
  it("builds a three scene with mesh and ambient light", async () => {
    const scene = createTestScene();
    const offscreenRenderer = createOffscreenRenderer();
    try {
      const built = await buildThreeSceneFromDomain(scene, {
        includeCamera: true,
        renderRenderer: offscreenRenderer,
      });

      expect(built.root.children.length).toBeGreaterThanOrEqual(2);

      built.dispose();
    } finally {
      offscreenRenderer.dispose();
      threeAssetRegistry.clear();
    }
  });
});

describe("SceneEncoder.export", () => {
  it("returns GLB binary with glTF header", async () => {
    const scene = createTestScene();
    const encoder = new SceneEncoder();

    const glb = await encoder.export("GLB", scene, {
      includeCamera: true,
      includeTextures: false,
    });

    expect(glb).toBeInstanceOf(ArrayBuffer);
    expect(glb.byteLength).toBeGreaterThan(12);

    const header = new Uint8Array(glb, 0, 4);
    expect(String.fromCharCode(...header)).toBe("glTF");

    threeAssetRegistry.clear();
  });

  it("throws for unsupported formats", async () => {
    const scene = createTestScene();
    const encoder = new SceneEncoder();

    await expect(encoder.export("OBJ", scene)).rejects.toThrow(
      "only GLB is supported"
    );

    threeAssetRegistry.clear();
  });
});
