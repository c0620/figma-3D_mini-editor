import { beforeEach, describe, expect, it } from "vitest";

import { ObjectAdditionHandler } from "@/handlers/objectAdditionHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CameraType, LightType } from "@/types/scene";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";

describe("ObjectAdditionHandler", () => {
  const storage = new SceneStorage();
  const handler = new ObjectAdditionHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("adds a perspective camera with defaults", () => {
    handler.execute({ kind: "Camera", id: "cam-new" });

    const camera = storage.findCameraById("cam-new");
    expect(camera).toMatchObject({
      type: CameraType.Perspective,
      name: "Perspective Camera",
      transform: { position: [0, 0, 5], rotation: [0, 0, 0], scale: [1, 1, 1] },
      pendingDelete: false,
    });
    expect(storage.getActiveObjectRef()).toEqual({
      id: "cam-new",
      kind: "Camera",
    });
  });

  it("adds a spot light with defaults", () => {
    handler.execute({ kind: "Light", id: "light-new" });

    const light = storage.findObjectById("light-new");
    expect(light).toMatchObject({
      kind: "Light",
      type: LightType.Spot,
      intensity: 1,
      transform: { position: [0, 5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    });
  });

  it("does not implement mesh addition", () => {
    expect(() => handler.execute({ kind: "Mesh", id: "mesh-new" })).toThrow(
      /Mesh addition is not implemented/
    );
  });

  it("snapshots a delete of the added object", () => {
    expect(handler.getStateBeforeExecute({ kind: "Light", id: "light-new" })).toEqual({
      type: CommandType.DeleteObject,
      snapshot: { id: "light-new", isDelete: true, kind: "Light" },
    });
  });
});
