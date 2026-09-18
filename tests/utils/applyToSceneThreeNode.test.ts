import { describe, expect, it } from "vitest";

import { applyToSceneThreeNode } from "@/utils/applyToSceneThreeNode";

import { TEST_IDS, createBasicScene } from "../helpers/sceneFixtures";

describe("applyToSceneThreeNode", () => {
  it("visits a node and its descendants in the scene graph", () => {
    const scene = createBasicScene();
    const visited: string[] = [];

    applyToSceneThreeNode(TEST_IDS.group, scene, (object) => {
      visited.push(object.id);
    });

    expect(visited).toEqual([TEST_IDS.group, TEST_IDS.childMesh]);
  });

  it("does nothing for an unknown id", () => {
    const scene = createBasicScene();
    const visited: string[] = [];

    applyToSceneThreeNode("missing", scene, (object) => {
      visited.push(object.id);
    });

    expect(visited).toEqual([]);
  });
});
