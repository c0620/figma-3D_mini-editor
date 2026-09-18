import { describe, expect, it } from "vitest";

import { buildSceneEntityList } from "@/store/sceneEntityList";

import {
  TEST_IDS,
  createBasicScene,
  createMesh,
} from "../helpers/sceneFixtures";

describe("buildSceneEntityList", () => {
  it("returns an empty list when there is no scene", () => {
    expect(buildSceneEntityList(null)).toEqual([]);
  });

  it("flattens the graph with nesting levels and labels", () => {
    const list = buildSceneEntityList(createBasicScene());
    const byId = Object.fromEntries(list.map((entity) => [entity.id, entity]));

    expect(byId[TEST_IDS.group]?.level).toBe(0);
    expect(byId[TEST_IDS.group]?.label).toBe("Group");
    expect(byId[TEST_IDS.childMesh]?.level).toBe(1);
    expect(byId[TEST_IDS.camera]?.level).toBe(0);
    expect(list.map((entity) => entity.id)).toContain(TEST_IDS.mesh);
  });

  it("skips pendingDelete nodes and does not walk their children", () => {
    const scene = createBasicScene();
    scene.groups[TEST_IDS.group]!.pendingDelete = true;

    const ids = buildSceneEntityList(scene).map((entity) => entity.id);
    expect(ids).not.toContain(TEST_IDS.group);
    expect(ids).not.toContain(TEST_IDS.childMesh);
  });

  it("skips a deleted child but keeps the parent", () => {
    const scene = createBasicScene();
    scene.meshes[TEST_IDS.childMesh] = createMesh({
      ...scene.meshes[TEST_IDS.childMesh],
      pendingDelete: true,
    });

    const ids = buildSceneEntityList(scene).map((entity) => entity.id);
    expect(ids).toContain(TEST_IDS.group);
    expect(ids).not.toContain(TEST_IDS.childMesh);
  });
});
