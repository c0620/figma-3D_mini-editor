import type { CameraState, Light, Scene, SceneObject } from '../types/scene';

import { useSceneStore } from './sceneStore';
import type { CameraPatch, LightPatch, SceneObjectPatch } from './sceneStore';
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

  patchSceneObject(objectId: string, patch: SceneObjectPatch): void {
    useSceneStore.getState().patchSceneObject(objectId, patch);
  }

  patchLight(lightId: string, patch: LightPatch): void {
    useSceneStore.getState().patchLight(lightId, patch);
  }

  patchCamera(patch: CameraPatch): void {
    useSceneStore.getState().patchCamera(patch);
  }

  findObjectById(id: string): SceneObject | null {
    const scene = useSceneStore.getState().scene;
    if (!scene) return null;
    return scene.objects.find((o) => o.id === id) ?? null;
  }

  findLightById(id: string): Light | null {
    const scene = useSceneStore.getState().scene;
    if (!scene) return null;
    return scene.lights.find((l) => l.id === id) ?? null;
  }

  getCamera(): CameraState | null {
    return useSceneStore.getState().scene?.camera ?? null;
  }

  setActive(id: string | null): void {
    useUiStore.getState().setActiveObjectId(id);
  }

  updateProjectName(name: string): void {
    useUiStore.getState().setProjectName(name);
  }
}
