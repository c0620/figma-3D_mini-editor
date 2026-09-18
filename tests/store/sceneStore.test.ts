import { beforeEach, describe, expect, it } from "vitest";

import { useSceneStore } from "@/store/sceneStore";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import {
  TEST_IDS,
  createCamera,
  createLight,
  createMesh,
  identityTransform,
} from "../helpers/sceneFixtures";

describe("useSceneStore", () => {
  beforeEach(() => {
    resetStores();
    loadBasicScene();
  });

  it("loads and clears a scene", () => {
    expect(useSceneStore.getState().scene?.id).toBe(TEST_IDS.scene);
    useSceneStore.getState().clearScene();
    expect(useSceneStore.getState().scene).toBeNull();
  });

  it("adds a mesh into the graph as a root", () => {
    const extra = createMesh({ id: "mesh-extra", name: "Extra" });
    useSceneStore.getState().addMesh(extra);

    const scene = useSceneStore.getState().scene!;
    expect(scene.meshes["mesh-extra"]).toMatchObject({ name: "Extra" });
    expect(scene.sceneGraph.roots).toContain("mesh-extra");
  });

  it("links a child light under an existing parent", () => {
    const childLight = createLight({
      id: "light-child",
      parentId: TEST_IDS.group,
      target: null,
    });
    useSceneStore.getState().addLight(childLight);

    expect(
      useSceneStore.getState().scene?.sceneGraph.graphThree[TEST_IDS.group]
    ).toContain("light-child");
  });

  it("merges a partial transform on patch", () => {
    useSceneStore.getState().patchMesh(TEST_IDS.mesh, {
      transform: { position: [3, 0, 0] },
      name: "Renamed",
    });

    const mesh = useSceneStore.getState().scene?.meshes[TEST_IDS.mesh];
    expect(mesh?.name).toBe("Renamed");
    expect(mesh?.transform).toEqual(
      identityTransform({ position: [3, 0, 0] })
    );
  });

  it("patches environment independently", () => {
    useSceneStore.getState().patchEnvironment({
      backgroundColor: "#111111",
      shadowsEnabled: true,
    });

    expect(useSceneStore.getState().scene?.environment).toEqual({
      backgroundColor: "#111111",
      shadowsEnabled: true,
    });
  });

  it("deletes a group and its descendants", () => {
    useSceneStore.getState().deleteObject({ id: TEST_IDS.group, kind: "Group" });

    const scene = useSceneStore.getState().scene!;
    expect(scene.groups[TEST_IDS.group]).toBeUndefined();
    expect(scene.meshes[TEST_IDS.childMesh]).toBeUndefined();
    expect(scene.sceneGraph.roots).not.toContain(TEST_IDS.group);
    expect(scene.sceneGraph.graphThree[TEST_IDS.group]).toBeUndefined();
  });

  it("clears light.target when the targeted object is deleted", () => {
    useSceneStore.getState().deleteObject({ id: TEST_IDS.mesh, kind: "Mesh" });

    expect(useSceneStore.getState().scene?.lights[TEST_IDS.light]?.target).toBeNull();
  });

  it("adds a camera into the cameras map", () => {
    const extra = createCamera({ id: "cam-2", name: "Second" });
    useSceneStore.getState().addCamera(extra);

    expect(useSceneStore.getState().scene?.cameras["cam-2"]?.name).toBe("Second");
    expect(useSceneStore.getState().scene?.sceneGraph.roots).toContain("cam-2");
  });
});
