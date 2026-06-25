import { findSceneObject } from "@/utils/findSceneObject";
import type {
  ObjectRef,
  CameraState,
  EnvironmentState,
  Scene,
  SceneGroup,
  SceneLight,
  SceneMesh,
  SceneObject,
  Transform,
  ObjectID,
} from "../types/scene";

import { create } from "zustand";
import { applyToSceneThreeNode } from "@/utils/applyToSceneThreeNode";
import { threeAssetRegistry } from "../store/threeAssetRegistry";

type SceneObjectPatch =
  | (Partial<
      Pick<SceneMesh, "visible" | "locked" | "name" | "pendingDelete">
    > & { transform?: Partial<Transform> })
  | (Partial<
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
    > & { transform?: Partial<Transform> })
  | (Partial<
      Pick<SceneGroup, "visible" | "locked" | "name" | "pendingDelete">
    > & { transform?: Partial<Transform> });

export type CameraPatch = Partial<Omit<CameraState, "transform">> & {
  transform?: Partial<Transform>;
};

export type EnvironmentPatch = Partial<EnvironmentState>;

interface SceneState {
  scene: Scene | null;
}

interface SceneActions {
  loadScene(scene: Scene): void;
  clearScene(): void;
  patchObject(objectId: string, patch: SceneObjectPatch): void;
  patchCamera(patch: CameraPatch): void;
  patchEnvironment(patch: EnvironmentPatch): void;
  traverseScene(): void; //toDo?
  addObject(object: SceneLight | SceneMesh | SceneGroup): void;
  addCamera(camera: CameraState): void;
  deleteObject(objectId: ObjectRef): void;
}

export type { SceneObjectPatch };

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  scene: null,

  loadScene: (scene) => set({ scene }),
  clearScene: () => set({ scene: null }),

  traverseScene: () => {},

  addObject: (newObject) =>
    set((state) => {
      const newRoots = [...state.scene!.sceneGraph.roots];
      const newObjects = { ...state.scene!.sceneGraph.objects };
      const newGraphThree = { ...state.scene!.sceneGraph.graphThree };

      if (newObject.parentId) {
        if (newObject.parentId in newGraphThree)
          newGraphThree[newObject.parentId].push(newObject.id);
        else newGraphThree[newObject.parentId] = [newObject.id];
      } else {
        newRoots.push(newObject.id);
      }
      newObjects[newObject.id] = newObject;
      return {
        scene: {
          ...state.scene!,
          sceneGraph: {
            roots: newRoots,
            objects: newObjects,
            graphThree: newGraphThree,
          },
        },
      };
    }),

  patchObject: (id, patch) =>
    set((state) => {
      const g = state.scene?.sceneGraph;
      const prev = g?.objects[id];
      if (!g || !prev) return state;

      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;

      const next = {
        ...prev,
        ...patch,
        transform: nextTransform,
      } as SceneObject;
      return {
        scene: {
          ...state.scene!,
          sceneGraph: { ...g, objects: { ...g.objects, [id]: next } },
        },
      };
    }),

  addCamera: (
    newCamera //toDo
  ) =>
    set((state) => {
      const newCameras = { ...state.scene!.cameras };
      return {
        scene: {
          ...state.scene!,
          cameras: newCameras,
        },
      };
    }),

  patchCamera: (patch) =>
    set((state) => {
      if (!state.scene) return state;
      if (!patch.id) throw new Error("patchCamera(sceneStore): no id provided");
      const prev = state.scene.cameras;

      const toPatch = prev[patch.id];
      const nextTransform = patch.transform
        ? { ...toPatch.transform, ...patch.transform }
        : toPatch.transform;

      const newCamera = { ...toPatch, ...patch, transform: nextTransform };
      return {
        scene: {
          ...state.scene,
          cameras: { ...prev, newCamera },
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
    //toDo: delete for Environment
    set((state) => {
      if (!state.scene) return state;

      const toDelete = findSceneObject(objectRef, state.scene);
      if (!toDelete) return state;

      if (objectRef.kind == "Camera") {
        if (Object.keys(state.scene.cameras).length > 1) {
          const newCameras = { ...state.scene.cameras };
          delete newCameras[objectRef.id];
          return {
            scene: {
              ...state.scene,
              cameras: { ...newCameras },
            },
          };
        }
      } else if (["Group", "Mesh", "Light"].includes(objectRef.kind)) {
        const IDsToDelete: SceneObject[] = [];
        const addToDelete = (obj: SceneObject) => IDsToDelete.push(obj);
        applyToSceneThreeNode(
          objectRef.id,
          state.scene.sceneGraph,
          addToDelete
        );
        const newGraphThree = state.scene.sceneGraph.graphThree;
        const newObjects = state.scene.sceneGraph.objects;
        const newRoots = state.scene.sceneGraph.roots;
        IDsToDelete.forEach((node) => {
          delete newGraphThree[node.id];
          if (node.parentId) {
            newGraphThree[node.parentId].filter((nodeID) => nodeID != node.id);
          }
          delete newObjects[node.id];
          newRoots.filter((rootID) => rootID != node.id);
          if (node.kind == "Group" || node.kind == "Mesh") {
            //is Group necessary?
            threeAssetRegistry.delete(node.id);
          }
        });
        return {
          scene: {
            ...state.scene,
            sceneGraph: {
              graphThree: newGraphThree,
              objects: newObjects,
              roots: newRoots,
            },
          },
        };
      }

      return {
        scene: {
          ...state.scene,
        },
      };
    });
  },
}));
