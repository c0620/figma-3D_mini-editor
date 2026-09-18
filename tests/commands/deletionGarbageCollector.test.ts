import { beforeEach, describe, expect, it } from "vitest";

import { DeletionGarbageCollector } from "@/commands/deletionGarbageCollector";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("DeletionGarbageCollector", () => {
  const storage = new SceneStorage();
  const gc = new DeletionGarbageCollector(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("hard-deletes a pending object when a restore snapshot is evicted", () => {
    storage.softDeleteObject({ id: TEST_IDS.light, kind: "Light" });
    expect(storage.findObjectById(TEST_IDS.light)?.pendingDelete).toBe(true);

    gc.purgeIfEvicted({
      type: CommandType.DeleteObject,
      snapshot: { id: TEST_IDS.light, isDelete: false, kind: "Light" },
    });

    expect(storage.findObjectById(TEST_IDS.light)).toBeNull();
  });

  it("keeps the object when the evicted snapshot is still a delete", () => {
    storage.softDeleteObject({ id: TEST_IDS.light, kind: "Light" });

    gc.purgeIfEvicted({
      type: CommandType.DeleteObject,
      snapshot: { id: TEST_IDS.light, isDelete: true, kind: "Light" },
    });

    expect(storage.findObjectById(TEST_IDS.light)?.pendingDelete).toBe(true);
  });

  it("ignores non-delete history entries", () => {
    gc.purgeIfEvicted({
      type: CommandType.TransformObject,
      snapshot: { id: TEST_IDS.mesh },
    });

    expect(storage.findObjectById(TEST_IDS.mesh)).not.toBeNull();
  });
});
