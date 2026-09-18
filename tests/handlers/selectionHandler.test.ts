import { beforeEach, describe, expect, it } from "vitest";

import { SelectionHandler } from "@/handlers/selectionHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("SelectionHandler", () => {
  const storage = new SceneStorage();
  const handler = new SelectionHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("selects a matching object and clears selection", () => {
    handler.execute({ id: TEST_IDS.mesh, kind: "Mesh" });
    expect(storage.getActiveObjectRef()).toEqual({
      id: TEST_IDS.mesh,
      kind: "Mesh",
    });

    handler.execute(null);
    expect(storage.getActiveObjectRef()).toBeNull();
  });

  it("ignores a kind mismatch", () => {
    handler.execute({ id: TEST_IDS.mesh, kind: "Light" });
    expect(storage.getActiveObjectRef()).toBeNull();
  });

  it("snapshots the current selection", () => {
    storage.setActiveObjectRef({ id: TEST_IDS.light, kind: "Light" });
    expect(handler.getStateBeforeExecute({ id: TEST_IDS.mesh, kind: "Mesh" })).toEqual({
      type: CommandType.SelectObject,
      snapshot: { id: TEST_IDS.light, kind: "Light" },
    });
  });
});
