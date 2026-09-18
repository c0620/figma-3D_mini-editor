import { beforeEach, describe, expect, it } from "vitest";

import { LightEditingHandler } from "@/handlers/lightEditingHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("LightEditingHandler", () => {
  const storage = new SceneStorage();
  const handler = new LightEditingHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("patches light intensity", () => {
    handler.execute({ id: TEST_IDS.light, changes: { intensity: 4 } });
    expect(storage.findObjectById(TEST_IDS.light)).toMatchObject({
      kind: "Light",
      intensity: 4,
    });
  });

  it("clears the rotate tool when a target is assigned", () => {
    storage.setActiveObjectTool("rotate");
    handler.execute({
      id: TEST_IDS.light,
      changes: { target: TEST_IDS.mesh },
    });
    expect(storage.getActiveObjectTool()).toBeNull();
  });

  it("snapshots the current light as the revert patch", () => {
    const light = storage.findObjectById(TEST_IDS.light);
    const entry = handler.getStateBeforeExecute({
      id: TEST_IDS.light,
      changes: { intensity: 9 },
    });

    expect(entry.type).toBe(CommandType.EditLight);
    expect(entry.snapshot.id).toBe(TEST_IDS.light);
    expect(entry.snapshot.changes).toMatchObject({
      id: TEST_IDS.light,
      intensity: light && "intensity" in light ? light.intensity : undefined,
    });
  });

  it("throws when the light is missing", () => {
    expect(() =>
      handler.getStateBeforeExecute({ id: "missing", changes: {} })
    ).toThrow(/light not found/);
  });
});
