import type {
  CameraState,
  Light,
  Material,
  Scene,
  SceneMesh,
  Transform,
} from "../types/scene";
import {
  normalizeCameraState,
  orthographicZoomFromPerspective,
  perspectiveZoomFromOrthographic,
} from "../types/scene";

import { create } from "zustand";

type SceneObjectPatch = Partial<
  Pick<SceneMesh, "visible" | "locked" | "name" | "pendingDelete"> & {
    transform: Partial<Transform>;
  }
>;

export type LightPatch = Partial<Omit<Light, "id" | "transform">> & {
  transform?: Partial<Transform>;
};

export type CameraPatch = Partial<Omit<CameraState, "transform">> & {
  transform?: Partial<Transform>;
};

export type MaterialPatch = Partial<
  Pick<
    Material,
    "baseColor" | "roughness" | "metalness" | "emissive" | "emissiveIntensity"
  > & {
    textures?: Partial<Material["textures"]>;
  }
>;

interface SceneState {
  scene: Scene | null;
}

interface SceneActions {
  loadScene(scene: Scene): void;
  clearScene(): void;
  patchSceneObject(objectId: string, patch: SceneObjectPatch): void;
  patchLight(lightId: string, patch: LightPatch): void;
  patchCamera(patch: CameraPatch): void;
  patchMaterial(materialId: string, patch: MaterialPatch): void;
}

export type { SceneObjectPatch };

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  scene: null,

  loadScene: (scene) =>
    set({
      scene: {
        ...scene,
        camera: normalizeCameraState(scene.camera),
      },
    }),
  clearScene: () => set({ scene: null }),

  patchSceneObject: (objectId, patch) =>
    set((state) => {
      if (!state.scene) return state;
      const idx = state.scene.meshes.findIndex((o) => o.id === objectId);
      if (idx < 0) return state;

      const prev = state.scene.meshes[idx];
      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;

      const { transform: _t, ...rest } = patch;
      const nextObjects = [...state.scene.meshes];
      nextObjects[idx] = { ...prev, ...rest, transform: nextTransform };
      return { scene: { ...state.scene, meshes: nextObjects } };
    }),

  patchLight: (lightId, patch) =>
    set((state) => {
      if (!state.scene) return state;
      const idx = state.scene.lights.findIndex((l) => l.id === lightId);
      if (idx < 0) return state;

      const prev = state.scene.lights[idx];
      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;

      const { transform: _t, ...rest } = patch;
      const nextLights = [...state.scene.lights];
      nextLights[idx] = { ...prev, ...rest, transform: nextTransform };
      return { scene: { ...state.scene, lights: nextLights } };
    }),

  patchCamera: (patch) =>
    set((state) => {
      if (!state.scene) return state;
      const prev = state.scene.camera;
      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;

      const { transform: _t, ...rest } = patch;
      const nextCamera = { ...prev, ...rest, transform: nextTransform };

      if (patch.type && patch.type !== prev.type) {
        const position = nextTransform.position;
        const orbitTarget = nextCamera.orbitTarget;
        const fov = nextCamera.fov;

        if (patch.type === "Orthographic") {
          nextCamera.orthographicZoom = orthographicZoomFromPerspective(
            prev.perspectiveZoom,
            position,
            orbitTarget,
            fov
          );
        } else {
          nextCamera.perspectiveZoom = perspectiveZoomFromOrthographic(
            prev.orthographicZoom,
            position,
            orbitTarget,
            fov
          );
        }
      }

      return {
        scene: {
          ...state.scene,
          camera: nextCamera,
        },
      };
    }),

  patchMaterial: (materialId, patch) =>
    set((state) => {
      if (!state.scene) return state;
      const prev = state.scene.materials[materialId];
      if (!prev) return state;

      const { textures: texturePatch, ...scalarPatch } = patch;
      const nextTextures = texturePatch
        ? { ...prev.textures, ...texturePatch }
        : prev.textures;

      return {
        scene: {
          ...state.scene,
          materials: {
            ...state.scene.materials,
            [materialId]: {
              ...prev,
              ...scalarPatch,
              textures: nextTextures,
            },
          },
        },
      };
    }),
}));
