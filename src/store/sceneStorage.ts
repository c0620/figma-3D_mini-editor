import type { Scene } from '../types/scene';

import { useSceneStore } from './sceneStore';
import { useUiStore } from './uiStore';

export class SceneStorage {
  load(scene: Scene): void {
    useSceneStore.getState().loadScene(scene);
  }

  getScene(): Scene {
    const scene = useSceneStore.getState().scene;
    if (!scene) throw new Error('SceneStorage.getScene: no scene loaded');
    return scene;
  }

  setActive(id: string | null): void {
    useUiStore.getState().setActiveObjectId(id);
  }

  updateProjectName(name: string): void {
    useUiStore.getState().setProjectName(name);
  }
}
