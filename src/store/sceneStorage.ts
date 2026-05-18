import type { Scene, SceneObject } from '../types/scene';

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

  patchSceneObject(
    objectId: string,
    patch: Partial<Pick<SceneObject, 'visible' | 'locked'>>,
  ): void {
    useSceneStore.getState().patchSceneObject(objectId, patch);
  }

  /** Объект сцены (меш) по id или null. */
  findObjectById(id: string): SceneObject | null {
    const scene = useSceneStore.getState().scene;
    if (!scene) return null;
    return scene.objects.find((o) => o.id === id) ?? null;
  }

  setActive(id: string | null): void {
    useUiStore.getState().setActiveObjectId(id);
  }

  updateProjectName(name: string): void {
    useUiStore.getState().setProjectName(name);
  }
}
