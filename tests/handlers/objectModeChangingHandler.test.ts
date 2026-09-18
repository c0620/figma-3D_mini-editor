import { beforeEach, describe, expect, it } from "vitest";

import {
  ToggleLockHandler,
  ToggleVisibilityHandler,
} from "@/handlers/objectModeChangingHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("ToggleVisibilityHandler", () => {
  const storage = new SceneStorage();
  const handler = new ToggleVisibilityHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("toggles mesh visibility", () => {
    handler.execute({ id: TEST_IDS.mesh });
    expect(storage.findObjectById(TEST_IDS.mesh)).toMatchObject({
      visible: false,
    });

    handler.execute({ id: TEST_IDS.mesh });
    expect(storage.findObjectById(TEST_IDS.mesh)).toMatchObject({
      visible: true,
    });
  });

  it("snapshots the current visible flag", () => {
    expect(handler.getStateBeforeExecute({ id: TEST_IDS.mesh })).toEqual({
      type: CommandType.ToggleVisibility,
      snapshot: { id: TEST_IDS.mesh, visible: true },
    });
  });

  it("refuses to toggle a camera", () => {
    expect(() => handler.execute({ id: TEST_IDS.camera })).toThrow(
      /object not found \/ camera found/
    );
  });
});

describe("ToggleLockHandler", () => {
  const storage = new SceneStorage();
  const handler = new ToggleLockHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("locks an object and clears the active tool", () => {
    storage.setActiveObjectTool("translate");
    handler.execute({ id: TEST_IDS.mesh });

    expect(storage.findObjectById(TEST_IDS.mesh)).toMatchObject({ locked: true });
    expect(storage.getActiveObjectTool()).toBeNull();
  });

  it("restores the tool from the snapshot payload when unlocking", () => {
    storage.patchObject(TEST_IDS.mesh, { locked: true });
    handler.execute({ id: TEST_IDS.mesh, _tool: "rotate" });

    expect(storage.findObjectById(TEST_IDS.mesh)).toMatchObject({ locked: false });
    expect(storage.getActiveObjectTool()).toBe("rotate");
  });

  it("snapshots lock state and the active tool", () => {
    storage.setActiveObjectTool("scale");
    expect(handler.getStateBeforeExecute({ id: TEST_IDS.mesh })).toEqual({
      type: CommandType.ToggleLock,
      snapshot: { id: TEST_IDS.mesh, locked: false, _tool: "scale" },
    });
  });
});
