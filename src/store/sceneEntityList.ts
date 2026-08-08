import type {
  SceneCamera,
  ObjectID,
  Scene,
  SceneGroup,
  SceneLight,
  SceneMesh,
} from "../types/scene";
import { findSceneObject } from "./sceneStorage";

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

  const currentScene = scene;
  const sceneGraph = currentScene.sceneGraph.graphThree;
  const roots = currentScene.sceneGraph.roots;

  const entityList: SceneEntitySummary[] = [];

  function buildRecursiveSceneList(id: ObjectID, level: number) {
    const node = sceneGraph[id];
    const sceneObj = findSceneObject(currentScene, id);

    if (!sceneObj || sceneObj.pendingDelete) return;

    entityList.push({ ...sceneObj, level, label: sceneObj.name });

    node?.forEach((childID) => buildRecursiveSceneList(childID, level + 1));
  }

  for (const root of roots) {
    buildRecursiveSceneList(root, 0);
  }

  return entityList;
}
