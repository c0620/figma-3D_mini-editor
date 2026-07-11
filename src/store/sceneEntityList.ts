import type {
  SceneCamera,
  ObjectID,
  Scene,
  SceneGraphObject,
  SceneGroup,
  SceneLight,
  SceneMesh,
} from "../types/scene";

type SceneEntityListMeta = {
  label: string;
  level: number;
};

export type SceneObjectEntitySummary =
  | SceneMesh
  | SceneLight
  | SceneGroup
  | SceneCamera;

export type SceneEntitySummary = SceneObjectEntitySummary & SceneEntityListMeta;

/**
 * Плоский список объектов для дерева сцены и выбора активного объекта.
 */
export function buildSceneEntityList(
  scene: Scene | null
): SceneEntitySummary[] {
  if (!scene) return [];

  const sceneGraph = scene.sceneGraph.graphThree;
  const roots = scene.sceneGraph.roots;
  const sceneObjs = scene.sceneGraph.objects;

  const entityList: SceneEntitySummary[] = [];

  function buildRecursiveSceneList(id: ObjectID, level: number) {
    const node = sceneGraph[id];
    const sceneObj = sceneObjs[id];

    if (!sceneObj || sceneObj.pendingDelete) return;

    entityList.push({ ...sceneObj, level, label: sceneObj.name });

    node?.forEach((childID) => buildRecursiveSceneList(childID, level + 1));
  }

  for (const root of roots) {
    buildRecursiveSceneList(root, 0);
  }

  return entityList;
}
