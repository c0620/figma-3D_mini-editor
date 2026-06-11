import type {
  CameraState,
  EnvironmentState,
  Light,
  Scene,
  SceneObject,
} from "../types/scene";

import { useSceneStore } from "./sceneStore";
import type {
  CameraPatch,
  EnvironmentPatch,
  LightPatch,
  SceneObjectPatch,
} from "./sceneStore";
import { useSessionStore } from "./sessionStore";
import type { ObjectToolMode } from "./sessionStore";

/**
 * Imperative-фасад над `sceneStore` и `sessionStore` для non-React слоя
 * (handlers, commands, IO, render). Прямых обращений к сторам в этих слоях
 * быть не должно — только через данный класс.
 */
export class SceneStorage {
  // --- Scene: чтение ---

  /** Сцена с гарантией наличия. Бросает, если сцена не загружена (для IO/render). */
  getScene(): Scene {
    const scene = useSceneStore.getState().scene;
    if (!scene) throw new Error("SceneStorage.getScene: no scene loaded");
    return scene;
  }

  /** Безопасное чтение сцены без исключения. */
  getSceneOrNull(): Scene | null {
    return useSceneStore.getState().scene;
  }

  getCamera(): CameraState | null {
    return useSceneStore.getState().scene?.camera ?? null;
  }

  getEnvironment(): EnvironmentState | null {
    return useSceneStore.getState().scene?.environment ?? null;
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

  // --- Scene: запись ---

  load(scene: Scene): void {
    useSceneStore.getState().loadScene(scene);
  }

  clearScene(): void {
    useSceneStore.getState().clearScene();
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

  patchEnvironment(patch: EnvironmentPatch): void {
    useSceneStore.getState().patchEnvironment(patch);
  }

  addLight(light: Light): void {
    useSceneStore.getState().addLight(light);
  }

  // --- Session: чтение ---

  getActiveObjectId(): string | null {
    return useSessionStore.getState().activeObjectId;
  }

  getProjectName(): string {
    return useSessionStore.getState().projectName;
  }

  getActiveObjectTool(): ObjectToolMode | null {
    return useSessionStore.getState().activeObjectTool;
  }

  // --- Session: запись ---

  setActiveObjectId(id: string | null): void {
    useSessionStore.getState().setActiveObjectId(id);
  }

  setProjectName(name: string): void {
    useSessionStore.getState().setProjectName(name);
  }

  setHistoryFlags(canUndo: boolean, canRedo: boolean): void {
    useSessionStore.getState().setHistoryFlags(canUndo, canRedo);
  }

  setActiveObjectTool(tool: ObjectToolMode): void {
    useSessionStore.getState().setActiveObjectTool(tool);
  }
}
