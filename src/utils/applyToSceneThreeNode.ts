import type { ObjectID, SceneGraph, SceneObject } from "@/types/scene";

export function applyToSceneThreeNode(
  objID: ObjectID,
  graph: SceneGraph,
  command: (obj: SceneObject) => void
) {
  command(graph.objects[objID]);
  if (graph.graphThree[objID].length != 0)
    graph.graphThree[objID].forEach((nodeID) =>
      applyToSceneThreeNode(nodeID, graph, command)
    );
}
