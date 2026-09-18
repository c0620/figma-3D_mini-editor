import { beforeEach, describe, expect, it } from "vitest";

import { EnvironmentHandler } from "@/handlers/environmentHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";

describe("EnvironmentHandler", () => {
  const storage = new SceneStorage();
  const handler = new EnvironmentHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("patches background and shadows", () => {
    handler.execute({ backgroundColor: "#ff00ff", shadowsEnabled: true });
    expect(storage.getEnvironment()).toEqual({
      backgroundColor: "#ff00ff",
      shadowsEnabled: true,
    });
  });

  it("snapshots ToggleShadows when only shadowsEnabled is patched", () => {
    const entry = handler.getStateBeforeExecute({ shadowsEnabled: true });
    expect(entry.type).toBe(CommandType.ToggleShadows);
    expect(entry.snapshot).toEqual({
      backgroundColor: null,
      shadowsEnabled: false,
    });
  });

  it("snapshots SetBackground for any other environment patch", () => {
    const entry = handler.getStateBeforeExecute({
      backgroundColor: "#000000",
    });
    expect(entry.type).toBe(CommandType.SetBackground);
  });

  it("throws when there is no environment", () => {
    resetStores();
    expect(() => handler.getStateBeforeExecute({ shadowsEnabled: true })).toThrow(
      /no environment/
    );
  });
});
