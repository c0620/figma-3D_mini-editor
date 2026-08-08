import type {
  ObjectRef,
  SceneCamera,
  EnvironmentState,
  Scene,
  SceneGroup,
  SceneLight,
  SceneMesh,
  SceneObject,
  Transform,
  ObjectID,
  MaterialID,
  Material,
} from "../types/scene";

import { create } from "zustand";
import { applyToSceneThreeNode } from "@/utils/applyToSceneThreeNode";
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import { Color } from "three";
import { produce } from "immer";

type SceneMaterialPatch = Pick<Material, "id"> &
  Partial<Omit<Material, "id" | "color">> & { color?: Color };

export type MeshPatch = Partial<
  Pick<SceneMesh, "visible" | "locked" | "name" | "pendingDelete" | "materials">
> & { transform?: Partial<Transform> };

export type LightPatch = Partial<
  Pick<
    SceneLight,
    | "visible"
    | "locked"
    | "name"
    | "pendingDelete"
    | "color"
    | "intensity"
    | "type"
  >
> & { transform?: Partial<Transform> };

export type GroupPatch = Partial<
  Pick<SceneGroup, "visible" | "locked" | "name" | "pendingDelete">
> & { transform?: Partial<Transform> };

export type CameraPatch = Partial<Omit<SceneCamera, "transform" | "id">> & {
  transform?: Partial<Transform>;
};

/** @deprecated use MeshPatch | LightPatch | GroupPatch */
export type SceneObjectPatch = MeshPatch | LightPatch | GroupPatch;

export type EnvironmentPatch = Partial<EnvironmentState>;

interface SceneState {
  scene: Scene | null;
}

interface SceneActions {
  loadScene(scene: Scene): void;
  clearScene(): void;
  addMesh(object: SceneMesh): void;
  addLight(object: SceneLight): void;
  addGroup(object: SceneGroup): void;
  addCamera(camera: SceneCamera): void;
  patchMesh(id: ObjectID, patch: MeshPatch): void;
  patchLight(id: ObjectID, patch: LightPatch): void;
  patchGroup(id: ObjectID, patch: GroupPatch): void;
  patchCamera(id: ObjectID, patch: CameraPatch): void;
  patchEnvironment(patch: EnvironmentPatch): void;
  traverseScene(): void; // TODO
  patchMaterial(id: MaterialID, patch: Partial<Omit<Material, "id">>): void;
  deleteObject(objectRef: ObjectRef): void;
}

function linkIntoGraph(
  scene: Scene,
  object: { id: ObjectID; parentId: ObjectID | null }
): void {
  const { roots, graphThree } = scene.sceneGraph;
  if (object.parentId) {
    if (object.parentId in graphThree) graphThree[object.parentId].push(object.id);
    else graphThree[object.parentId] = [object.id];
  } else {
    roots.push(object.id);
  }
}

function unlinkFromGraph(
  scene: Scene,
  id: ObjectID,
  parentId: ObjectID | null
): void {
  const { roots, graphThree } = scene.sceneGraph;
  scene.sceneGraph.roots = roots.filter((rootID) => rootID !== id);

  if (parentId && graphThree[parentId]) {
    graphThree[parentId] = graphThree[parentId].filter(
      (childID) => childID !== id
    );
    if (graphThree[parentId].length === 0) delete graphThree[parentId];
  }

  delete graphThree[id];
}

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  scene: null,

  loadScene: (scene) => set({ scene }),
  clearScene: () => set({ scene: null }),

  traverseScene: () => {},

  addMesh: (newObject) =>
    set((state) => {
      if (!state.scene) return state;
      return {
        scene: produce(state.scene, (scene) => {
          linkIntoGraph(scene, newObject);
          scene.meshes[newObject.id] = newObject;
        }),
      };
    }),

  addLight: (newObject) =>
    set((state) => {
      if (!state.scene) return state;
      return {
        scene: produce(state.scene, (scene) => {
          linkIntoGraph(scene, newObject);
          scene.lights[newObject.id] = newObject;
        }),
      };
    }),

  addGroup: (newObject) =>
    set((state) => {
      if (!state.scene) return state;
      return {
        scene: produce(state.scene, (scene) => {
          linkIntoGraph(scene, newObject);
          scene.groups[newObject.id] = newObject;
        }),
      };
    }),

  addCamera: (newCamera) =>
    set((state) => {
      if (!state.scene) return state;
      return {
        scene: produce(state.scene, (scene) => {
          linkIntoGraph(scene, newCamera);
          scene.cameras[newCamera.id] = newCamera;
        }),
      };
    }),

  patchMesh: (id, patch) =>
    set((state) => {
      const prev = state.scene?.meshes[id];
      if (!state.scene || !prev) return state;
      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;
      return {
        scene: {
          ...state.scene,
          meshes: {
            ...state.scene.meshes,
            [id]: { ...prev, ...patch, transform: nextTransform },
          },
        },
      };
    }),

  patchLight: (id, patch) =>
    set((state) => {
      const prev = state.scene?.lights[id];
      if (!state.scene || !prev) return state;
      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;
      return {
        scene: {
          ...state.scene,
          lights: {
            ...state.scene.lights,
            [id]: { ...prev, ...patch, transform: nextTransform },
          },
        },
      };
    }),

  patchGroup: (id, patch) =>
    set((state) => {
      const prev = state.scene?.groups[id];
      if (!state.scene || !prev) return state;
      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;
      return {
        scene: {
          ...state.scene,
          groups: {
            ...state.scene.groups,
            [id]: { ...prev, ...patch, transform: nextTransform },
          },
        },
      };
    }),

  patchCamera: (id, patch) =>
    set((state) => {
      if (!state.scene) return state;
      const toPatch = state.scene.cameras[id];
      if (!toPatch) return state;
      const nextTransform = patch.transform
        ? { ...toPatch.transform, ...patch.transform }
        : toPatch.transform;

      return {
        scene: produce(state.scene, (scene) => {
          scene.cameras[id] = {
            ...toPatch,
            ...patch,
            transform: nextTransform,
          } as SceneCamera;
        }),
      };
    }),

  patchMaterial: (id, patch) =>
    set((state) => {
      if (!state.scene) return state;
      const material = { ...state.scene.materials[id] };
      if (!material) return state;
      const { textures, ...threePatch } = patch;
      const next = { ...material, ...patch };
      if (threePatch.color) {
        (threePatch as SceneMaterialPatch).color = threePatch.color.value;
      }
      if (Object.keys(threePatch).length)
        threeAssetRegistry.setParam(id, threePatch as SceneMaterialPatch);
      return {
        scene: {
          ...state.scene,
          materials: { ...state.scene.materials, [id]: next },
        },
      };
    }),

  patchEnvironment: (patch) =>
    set((state) => {
      if (!state.scene) return state;
      return {
        scene: {
          ...state.scene,
          environment: { ...state.scene.environment, ...patch },
        },
      };
    }),

  deleteObject: (objectRef) => {
    // TODO: delete for Environment
    set((state) => {
      if (!state.scene) return state;

      const IDsToDelete: SceneObject[] = [];
      const addToDelete = (obj: SceneObject) => IDsToDelete.push(obj);
      applyToSceneThreeNode(objectRef.id, state.scene, addToDelete);

      const newSceneState = produce(state.scene, (scene) => {
        IDsToDelete.forEach((node) => {
          unlinkFromGraph(scene, node.id, node.parentId);
          switch (node.kind) {
            case "Light":
              delete scene.lights[node.id];
              break;
            case "Mesh":
              threeAssetRegistry.delete(node.id);
              delete scene.meshes[node.id];
              break;
            case "Group":
              delete scene.groups[node.id];
              break;
            case "Camera":
              delete scene.cameras[node.id];
          }
        });
      });

      return { scene: newSceneState };
    });
  },
}));
