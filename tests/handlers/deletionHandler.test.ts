import { beforeEach, describe, expect, it } from "vitest";

import { DeletionHandler } from "@/handlers/deletionHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("DeletionHandler", () => {
  const storage = new SceneStorage();
  const handler = new DeletionHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("soft-deletes and restores a mesh", () => {
    handler.execute({ id: TEST_IDS.mesh, isDelete: true, kind: "Mesh" });
    expect(storage.findObjectById(TEST_IDS.mesh)).toMatchObject({
      pendingDelete: true,
      visible: false,
    });

    handler.execute({ id: TEST_IDS.mesh, isDelete: false, kind: "Mesh" });
    expect(storage.findObjectById(TEST_IDS.mesh)).toMatchObject({
      pendingDelete: false,
      visible: true,
    });
  });

  it("inverts isDelete in the snapshot", () => {
    expect(
      handler.getStateBeforeExecute({
        id: TEST_IDS.mesh,
        isDelete: true,
        kind: "Mesh",
      })
    ).toEqual({
      type: CommandType.DeleteObject,
      snapshot: { id: TEST_IDS.mesh, isDelete: false, kind: "Mesh" },
    });
  });

  it("throws when soft-deleting a missing object", () => {
    expect(() =>
      handler.execute({ id: "missing", isDelete: true, kind: "Mesh" })
    ).toThrow(/no object to delete/);
  });
});
