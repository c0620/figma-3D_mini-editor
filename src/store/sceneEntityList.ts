import type { ObjectID, Scene, Transform } from "../types/scene";

export type SceneEntityKind = "Light" | "Mesh" | "Group" | "Camera";

export interface SceneEntitySummary {
  id: string;
  kind: SceneEntityKind;
  label: string;
  visible: boolean;
  locked: boolean;
  level: number;
}

/** Стабильный id виртуальной камеры доменной сцены (в CameraState нет своего uuid). */

/** Transform сущности по id (включая синтетический id камеры). */
// export function transformByEntityId(
//   scene: Scene,
//   entityId: string
// ): Transform | null {
//   if (entityId == "camera") return scene.camera.transform;
//   return scene.sceneGraph.objects[entityId]?.transform ?? null;
// }

/**
 * Плоский список объектов для дерева сцены и выбора активного объекта.
 * Порядок: меши → источники света → камера → окружение.
 */
// export function buildSceneEntityListLegacy(
//   scene: Scene | null
// ): SceneEntitySummary[] {
//   if (!scene) return [];

//   const items: SceneEntitySummary[] = [];

//   for (const o of scene.objects) {
//     if (o.pendingDelete) continue;
//     items.push({
//       id: o.id,
//       kind: "mesh",
//       label: o.name || "Mesh",
//       visible: o.visible,
//       locked: o.locked,
//     });
//   }

//   for (const light of scene.lights) {
//     const kindLabel =
//       light.type === "Directional" ? "Направленный свет" : "Окружающий свет";
//     items.push({
//       id: light.id,
//       kind: "light",
//       label: `${kindLabel} (${light.id.slice(0, 8)})`,
//       visible: light.visible,
//       locked: light.locked,
//     });
//   }

//   items.push({
//     id: sceneCameraEntityId(scene.id),
//     kind: "camera",
//     label:
//       scene.camera.type === "Perspective"
//         ? "Камера (перспектива)"
//         : "Камера (ортография)",
//     visible: true,
//     locked: false,
//   });

//   return items;
// }

export function buildSceneEntityList(scene: Scene | null) {
  if (!scene) return [];

  const sceneGraph = scene.sceneGraph.graphThree;
  const roots = scene.sceneGraph.roots;
  const sceneObjs = scene.sceneGraph.objects;

  const entityList: SceneEntitySummary[] = [];

  function buildRecursiveSceneList(id: ObjectID, level: number) {
    const node = sceneGraph[id];
    const sceneObj = sceneObjs[id];

    if (!sceneObj.pendingDelete) {
      entityList.push({
        id,
        kind: sceneObj.kind,
        label: sceneObj.name,
        visible: sceneObj.visible,
        locked: sceneObj.locked,
        level,
      });
      if (!node) {
        return;
      } else {
        node.forEach((childID) => buildRecursiveSceneList(childID, level + 1));
      }
    }
  }

  for (const root of roots) {
    buildRecursiveSceneList(root, 0);
  }

  for (const cameraID in scene.cameras) {
    const camera = scene.cameras[cameraID];
    if (!camera.pendingDelete) {
      entityList.push({
        id: cameraID,
        kind: "Camera",
        label: camera.type,
        visible: true,
        locked: camera.locked,
        level: 0,
      });
    }
  }
  return entityList;
}
