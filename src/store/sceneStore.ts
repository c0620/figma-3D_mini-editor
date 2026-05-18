import type { Scene, SceneObject } from '../types/scene';

import { create } from 'zustand';

interface SceneState {
  scene: Scene | null;
}

interface SceneActions {
  loadScene(scene: Scene): void;
  clearScene(): void;
  patchSceneObject(
    objectId: string,
    patch: Partial<Pick<SceneObject, 'visible' | 'locked'>>,
  ): void;
}

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
      const nextObjects = [...state.scene.objects];
      nextObjects[idx] = { ...prev, ...patch };
      return { scene: { ...state.scene, objects: nextObjects } };
    }),
}));
