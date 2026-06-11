import type {
  CameraState,
  EnvironmentState,
  Light,
  Scene,
  SceneObject,
  Transform,
} from '../types/scene';

import { create } from 'zustand';

type SceneObjectPatch = Partial<
  Pick<SceneObject, 'visible' | 'locked' | 'name' | 'pendingDelete'> & {
    transform: Partial<Transform>;
  }
>;

export type LightPatch = Partial<Omit<Light, 'id' | 'transform'>> & {
  transform?: Partial<Transform>;
};

export type CameraPatch = Partial<Omit<CameraState, 'transform'>> & {
  transform?: Partial<Transform>;
};

export type EnvironmentPatch = Partial<EnvironmentState>;

interface SceneState {
  scene: Scene | null;
}

interface SceneActions {
  loadScene(scene: Scene): void;
  clearScene(): void;
  patchSceneObject(objectId: string, patch: SceneObjectPatch): void;
  patchLight(lightId: string, patch: LightPatch): void;
  patchCamera(patch: CameraPatch): void;
  patchEnvironment(patch: EnvironmentPatch): void;
  addLight(light: Light): void;
}

export type { SceneObjectPatch };

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  scene: null,

  loadScene: (scene) => set({ scene }),
  clearScene: () => set({ scene: null }),

  patchSceneObject: (objectId, patch) =>
    set((state) => {
      if (!state.scene) return state;
      const idx = state.scene.objects.findIndex((o) => o.id === objectId);
      if (idx < 0) return state;

      const prev = state.scene.objects[idx];
      const nextTransform = patch.transform
        ? { ...prev.transform, ...patch.transform }
        : prev.transform;

      const { transform: _t, ...rest } = patch;
      const nextObjects = [...state.scene.objects];
      nextObjects[idx] = { ...prev, ...rest, transform: nextTransform };
      return { scene: { ...state.scene, objects: nextObjects } };
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
      return {
        scene: {
          ...state.scene,
          camera: { ...prev, ...rest, transform: nextTransform },
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

  addLight: (light) =>
    set((state) => {
      if (!state.scene) return state;
      return {
        scene: { ...state.scene, lights: [...state.scene.lights, light] },
      };
    }),
}));
