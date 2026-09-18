import { beforeEach, describe, expect, it } from "vitest";

import { CameraEditingHandler } from "@/handlers/cameraEditingHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("CameraEditingHandler", () => {
  const storage = new SceneStorage();
  const handler = new CameraEditingHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("patches camera optics without touching the view", () => {
    handler.execute({ id: TEST_IDS.camera, fov: 35, near: 0.5 });

    const camera = storage.findCameraById(TEST_IDS.camera);
    expect(camera?.fov).toBe(35);
    expect(camera?.near).toBe(0.5);
    expect(camera?.transform.position).toEqual([0, 0, 5]);
  });

  it("snapshots the full camera before execute", () => {
    const before = storage.findCameraById(TEST_IDS.camera);
    const entry = handler.getStateBeforeExecute({
      id: TEST_IDS.camera,
      fov: 20,
    });

    expect(entry.type).toBe(CommandType.EditCamera);
    expect(entry.snapshot).toEqual(before);
  });

  it("throws when the camera is missing", () => {
    expect(() => handler.getStateBeforeExecute({ id: "missing" })).toThrow(
      /no id\/camera/
    );
  });
});
