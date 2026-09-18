import { beforeEach, describe, expect, it } from "vitest";

import { TransformObjectHandler } from "@/handlers/transformObjectHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

describe("TransformObjectHandler", () => {
  const storage = new SceneStorage();
  const handler = new TransformObjectHandler(storage);

  beforeEach(() => {
    resetStores();
    storage.load(loadBasicScene());
  });

  it("patches mesh position and keeps the rest of the transform", () => {
    handler.execute({
      objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
      position: [2, 3, 4],
    });

    expect(storage.findObjectById(TEST_IDS.mesh)?.transform).toEqual({
      position: [2, 3, 4],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
  });

  it("snapshots the transform before execute", () => {
    storage.patchObject(TEST_IDS.mesh, { transform: { position: [9, 0, 0] } });

    expect(
      handler.getStateBeforeExecute({
        objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
        position: [1, 0, 0],
      })
    ).toEqual({
      type: CommandType.TransformObject,
      snapshot: {
        objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
        position: [9, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    });
  });

  it("updates camera position through orbit normalization", () => {
    handler.execute({
      objectRef: { id: TEST_IDS.camera, kind: "Camera" },
      position: [5, 0, 0],
    });

    const camera = storage.findCameraById(TEST_IDS.camera);
    expect(camera?.transform.position).toEqual([5, 0, 0]);
    expect(camera?.target).toEqual([0, 0, 0]);
  });

  it("throws when snapshotting a missing object", () => {
    expect(() =>
      handler.getStateBeforeExecute({
        objectRef: { id: "missing", kind: "Mesh" },
        position: [0, 0, 0],
      })
    ).toThrow(/object not found/);
  });
});
