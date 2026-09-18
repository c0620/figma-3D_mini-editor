import { beforeEach, describe, expect, it } from "vitest";

import { SceneStorage } from "@/store/sceneStorage";
import { useSceneStore } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS, createCamera, createMesh } from "../helpers/sceneFixtures";

describe("SceneStorage", () => {
  const storage = new SceneStorage();

  beforeEach(() => {
    resetStores();
  });

  it("throws from getScene when nothing is loaded", () => {
    expect(() => storage.getScene()).toThrow(/no scene loaded/);
    expect(storage.getSceneOrNull()).toBeNull();
  });

  it("loads a scene and finds objects by id", () => {
    storage.load(loadBasicScene());

    expect(storage.getScene().id).toBe(TEST_IDS.scene);
    expect(storage.findObjectById(TEST_IDS.mesh)?.kind).toBe("Mesh");
    expect(storage.findCameraById(TEST_IDS.camera)?.kind).toBe("Camera");
    expect(storage.findObjectById("missing")).toBeNull();
  });

  it("selects the added object as active", () => {
    storage.load(loadBasicScene());
    const extra = createMesh({ id: "mesh-new", name: "New" });
    storage.addObject(extra);

    expect(useSceneStore.getState().scene?.meshes["mesh-new"]).toBeDefined();
    expect(storage.getActiveObjectRef()).toEqual({
      id: "mesh-new",
      kind: "Mesh",
    });
    expect(useSessionStore.getState().activeObjectTool).toBeNull();
  });

  it("soft-deletes a mesh and clears the selection", () => {
    storage.load(loadBasicScene());
    storage.setActiveObjectRef({ id: TEST_IDS.mesh, kind: "Mesh" });
    storage.softDeleteObject({ id: TEST_IDS.mesh, kind: "Mesh" });

    const mesh = storage.findObjectById(TEST_IDS.mesh);
    expect(mesh).toMatchObject({ pendingDelete: true, visible: false });
    expect(storage.getActiveObjectRef()).toBeNull();
  });

  it("refuses to delete the last camera", () => {
    storage.load(loadBasicScene());
    expect(() =>
      storage.softDeleteObject({ id: TEST_IDS.camera, kind: "Camera" })
    ).toThrow(/can't delete only camera/);
  });

  it("switches the active camera when a spare camera is soft-deleted", () => {
    storage.load(loadBasicScene());
    storage.addObject(createCamera({ id: "cam-2", name: "Spare" }));
    useSessionStore.getState().setActiveCameraID("cam-2");

    storage.softDeleteObject({ id: "cam-2", kind: "Camera" });

    expect(storage.findCameraById("cam-2")?.pendingDelete).toBe(true);
    expect(useSessionStore.getState().activeCameraID).toBe(TEST_IDS.camera);
  });

  it("hard-deletes an object from the scene maps", () => {
    storage.load(loadBasicScene());
    storage.deleteObject({ id: TEST_IDS.light, kind: "Light" });

    expect(storage.findObjectById(TEST_IDS.light)).toBeNull();
  });
});
