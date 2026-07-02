import type {
  CameraID,
  CameraState,
  EnvironmentState,
  Material,
  MaterialID,
  ObjectID,
  ObjectRef,
  Scene,
  SceneObject,
} from "../types/scene";

import { useSceneStore } from "./sceneStore";
import type {
  CameraPatch,
  EnvironmentPatch,
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
  private onClear?: () => void;

  setOnClear(fn: () => void): void {
    this.onClear = fn;
  }

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

  getEnvironment(): EnvironmentState | null {
    return useSceneStore.getState().scene?.environment ?? null;
  }

  getActiveCamera(): CameraState {
    const cameras = useSceneStore.getState().scene?.cameras;
    if (!cameras)
      throw new Error("getActiveCamera(SceneStorage): no camera at all");
    return cameras[Object.keys(cameras)[0]]; //toDo: now method returns 1st camera
  }

  getMaterial(id: MaterialID): Material | undefined {
    return useSceneStore.getState().scene?.materials[id];
  }

  findObjectById(id: ObjectID): SceneObject | null {
    const scene = useSceneStore.getState().scene;
    if (!scene) return null;
    return scene.sceneGraph.objects[id];
  }

  findCameraById(id: CameraID): CameraState | null {
    const scene = useSceneStore.getState().scene;
    if (!scene || !scene.cameras) return null;
    return scene.cameras[id];
  }

  // --- Scene: запись ---

  load(scene: Scene): void {
    useSceneStore.getState().loadScene(scene);
  }

  clearScene(): void {
    useSceneStore.getState().clearScene();
  }

  addObject(object: SceneObject): void {
    useSceneStore.getState().addObject(object);
  }

  patchObject(objectId: string, patch: SceneObjectPatch): void {
    useSceneStore.getState().patchObject(objectId, patch);
  }

  patchMaterial(id: MaterialID, patch: Partial<Omit<Material, "id">>): void {
    useSceneStore.getState().patchMaterial(id, patch);
  }

  patchCamera(patch: CameraPatch): void {
    useSceneStore.getState().patchCamera(patch);
  }

  patchEnvironment(patch: EnvironmentPatch): void {
    useSceneStore.getState().patchEnvironment(patch);
  }

  deleteObject(objectRef: ObjectRef): void {
    useSessionStore.getState().setActiveObjectTool(null);
    useSessionStore.getState().setActiveObjectRef(null);
    useSceneStore.getState().deleteObject(objectRef);
  }

  // --- Session: чтение ---

  getActiveObjectRef(): ObjectRef | null {
    return useSessionStore.getState().activeObjectRef;
  }

  getProjectName(): string {
    return useSessionStore.getState().projectName;
  }

  getActiveObjectTool(): ObjectToolMode | null {
    return useSessionStore.getState().activeObjectTool;
  }

  // --- Session: запись ---

  setActiveObjectId(objectRef: ObjectRef | null): void {
    useSessionStore.getState().setActiveObjectRef(objectRef);
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
