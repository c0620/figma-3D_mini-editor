import { create } from 'zustand';

import type { Scene } from '../types/scene';

interface SceneState {
  scene: Scene | null;
}

interface SceneActions {
  loadScene(scene: Scene): void;
  clearScene(): void;
}

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  scene: null,

  loadScene: (scene) => set({ scene }),
  clearScene: () => set({ scene: null }),
}));
