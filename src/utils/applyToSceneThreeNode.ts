import type { ObjectID, Scene, SceneObject } from "@/types/scene";

export function applyToSceneThreeNode(
  objID: ObjectID,
  scene: Scene,
  command: (obj: SceneObject) => void
) {
  const graph = scene.sceneGraph;
  const obj =
    scene.meshes[objID] ??
    scene.lights[objID] ??
    scene.groups[objID] ??
    scene.cameras[objID];
  if (obj) command(obj);

  if (objID in graph.graphThree && graph.graphThree[objID]?.length != 0)
    graph.graphThree[objID].forEach((nodeID) => {
      applyToSceneThreeNode(nodeID, scene, command);
    });
}
