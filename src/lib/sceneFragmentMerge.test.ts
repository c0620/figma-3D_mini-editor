import { BoxGeometry } from "three";
import { describe, expect, it, afterEach } from "vitest";

import { threeAssetRegistry } from "../store/threeAssetRegistry";
import { withDefaultAmbientLight } from "../lights/lightDefaults";
import {
  DEFAULT_CAMERA_STATE,
  TextureSlot,
  type Material,
  type Scene,
  type SceneMesh,
} from "../types/scene";
import { remapSceneFragmentIds } from "./sceneFragmentMerge";
import { randomUUID } from "./randomId";

function createFragment(meshId: string, materialId: string): Scene {
  threeAssetRegistry.register(meshId, {
    geometry: new BoxGeometry(1, 1, 1),
  });

  const material: Material = {
    id: materialId,
    baseColor: "#cccccc",
    baseColorVariableId: null,
    roughness: 0.2,
    metalness: 0.85,
    emissive: "#000000",
    emissiveIntensity: 1,
    textures: {
      [TextureSlot.BaseColor]: null,
      [TextureSlot.Normal]: null,
      [TextureSlot.Roughness]: null,
      [TextureSlot.Metalness]: null,
      [TextureSlot.Emissive]: null,
    },
    name: "FragmentMat",
  };

  const mesh: SceneMesh = {
    id: meshId,
    name: "FragmentMesh",
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
    id: randomUUID(),
    meshes: [mesh],
    materials: { [materialId]: material },
    lights: withDefaultAmbientLight([]),
    camera: { ...DEFAULT_CAMERA_STATE },
    environment: { backgroundColor: null, shadowsEnabled: false },
  };
}

afterEach(() => {
  threeAssetRegistry.clear();
});

describe("remapSceneFragmentIds", () => {
  it("assigns new mesh and material ids and moves registry entries", () => {
    const meshId = "mesh-old";
    const materialId = "mat-old";
    const remapped = remapSceneFragmentIds(createFragment(meshId, materialId));

    expect(remapped.meshes[0].id).not.toBe(meshId);
    expect(remapped.meshes[0].materialIDs[0]).not.toBe(materialId);
    expect(remapped.materials[remapped.meshes[0].materialIDs[0]].id).toBe(
      remapped.meshes[0].materialIDs[0]
    );
    expect(threeAssetRegistry.get(meshId)).toBeUndefined();
    expect(threeAssetRegistry.get(remapped.meshes[0].id)).toBeDefined();
  });
});
