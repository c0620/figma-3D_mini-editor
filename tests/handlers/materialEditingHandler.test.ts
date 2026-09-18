import { MeshStandardMaterial } from "three";
import { beforeEach, describe, expect, it } from "vitest";

import { MaterialEditingHandler } from "@/handlers/materialEditingHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("MaterialEditingHandler", () => {
  const storage = new SceneStorage();
  const handler = new MaterialEditingHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
    threeAssetRegistry.materials[TEST_IDS.material] = {
      linkCount: 1,
      material: new MeshStandardMaterial({ roughness: 0.5 }),
    };
  });

  it("patches non-texture material params", () => {
    handler.execute({ id: TEST_IDS.material, roughness: 0.2, metalness: 0.8 });

    expect(storage.getMaterial(TEST_IDS.material)).toMatchObject({
      roughness: 0.2,
      metalness: 0.8,
    });
  });

  it("snapshots scalar fields and omits textures", () => {
    const entry = handler.getStateBeforeExecute({
      id: TEST_IDS.material,
      roughness: 0.1,
    });

    expect(entry.type).toBe(CommandType.EditMaterial);
    expect(entry.snapshot.id).toBe(TEST_IDS.material);
    expect(entry.snapshot.roughness).toBe(0.5);
    expect(entry.snapshot.textures).toBeUndefined();
  });

  it("throws when the material is missing", () => {
    expect(() =>
      handler.getStateBeforeExecute({ id: "missing", roughness: 1 })
    ).toThrow(/no material/);
  });
});
