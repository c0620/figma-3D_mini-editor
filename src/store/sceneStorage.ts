import type {
  SceneCamera,
  EnvironmentState,
  Material,
  MaterialID,
  ObjectID,
  ObjectRef,
  Scene,
  SceneObject,
  SceneMesh,
  SceneLight,
  SceneGroup,
  Transform,
} from "../types/scene";

import { useSceneStore } from "./sceneStore";
import type {
  CameraPatch,
  EnvironmentPatch,
  GroupPatch,
  LightPatch,
  MeshPatch,
} from "./sceneStore";
import { useSessionStore } from "./sessionStore";
import type { ObjectToolMode } from "./sessionStore";

type CommonObjectPatch = { transform?: Partial<Transform> } & (
  | Partial<Omit<SceneMesh, "id" | "transform">>
  | Partial<Omit<SceneLight, "id" | "transform">>
  | Partial<Omit<SceneGroup, "id" | "transform">>
  | Partial<Omit<SceneCamera, "id" | "transform">>
);

export function findSceneObject(
  scene: Scene,
  id: ObjectID
): SceneObject | null {
  return (
    scene.meshes[id] ??
    scene.lights[id] ??
    scene.groups[id] ??
    scene.cameras[id] ??
    null
  );
}

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

  getActiveCamera(): SceneCamera {
    const cameras = useSceneStore.getState().scene!.cameras;
    const camera = cameras[useSessionStore.getState().activeCameraID];
    return camera as SceneCamera;
  }

  getMaterial(id: MaterialID): Material | undefined {
    return useSceneStore.getState().scene?.materials[id];
  }

  findObjectById(id: ObjectID): SceneObject | null {
    const scene = useSceneStore.getState().scene;
    if (!scene) return null;
    return findSceneObject(scene, id);
  }

  findCameraById(id: ObjectID): SceneCamera | null {
    const scene = useSceneStore.getState().scene;
    if (!scene) return null;
    const camera = scene.cameras[id];
    if (!camera || camera.kind != "Camera") return null;
    return camera;
  }

  // --- Scene: запись ---

  load(scene: Scene): void {
    useSceneStore.getState().loadScene(scene);
  }

  clearScene(): void {
    useSceneStore.getState().clearScene();
  }

  addObject(object: SceneObject): void {
    const store = useSceneStore.getState();
    const session = useSessionStore.getState();

    switch (object.kind) {
      case "Mesh":
        store.addMesh(object);
        break;
      case "Light":
        store.addLight(object);
        break;
      case "Group":
        store.addGroup(object);
        break;
      case "Camera":
        store.addCamera(object);
    }

    session.setActiveObjectTool(null);
    session.setActiveObjectRef({ id: object.id, kind: object.kind });
  }

  addMaterial(material: Material): void {
    const store = useSceneStore.getState();
    store.addMaterial(material);
  }

  patchObject(objectId: string, patch: CommonObjectPatch): void {
    const scene = useSceneStore.getState().scene;
    if (!scene) return;
    const store = useSceneStore.getState();

    if (objectId in scene.meshes) {
      store.patchMesh(objectId, patch as MeshPatch);
    } else if (objectId in scene.lights) {
      store.patchLight(objectId, patch as LightPatch);
    } else if (objectId in scene.groups) {
      store.patchGroup(objectId, patch as GroupPatch);
    } else if (objectId in scene.cameras) {
      store.patchCamera(objectId, patch as CameraPatch);
    }
  }

  patchMaterial(id: MaterialID, patch: Partial<Omit<Material, "id">>): void {
    useSceneStore.getState().patchMaterial(id, patch);
  }

  patchEnvironment(patch: EnvironmentPatch): void {
    useSceneStore.getState().patchEnvironment(patch);
  }

  softDeleteObject(objectRef: ObjectRef): void {
    if (objectRef.kind == "Camera") {
      const cameras = useSceneStore.getState().scene!.cameras;
      if (Object.keys(cameras).length == 1)
        throw new Error(
          "softDeleteObject(sceneStorage): can't delete only camera in scene"
        );
      useSessionStore
        .getState()
        .setActiveCameraID(
          Object.keys(cameras).filter((cid) => cid != objectRef.id)[0]
        );
      this.patchObject(objectRef.id, { pendingDelete: true });
    } else {
      this.patchObject(objectRef.id, {
        visible: false,
        pendingDelete: true,
      });
    }
    useSessionStore.getState().setActiveObjectRef(null);
    useSessionStore.getState().setActiveObjectTool(null);
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

  setActiveObjectRef(objectRef: ObjectRef | null): void {
    const session = useSessionStore.getState();
    session.setActiveObjectRef(objectRef);
    if (
      objectRef?.kind === "Light" &&
      session.activeObjectTool === "rotate" &&
      useSceneStore.getState().scene?.lights[objectRef.id]?.target
    ) {
      session.setActiveObjectTool(null);
    }
  }

  setProjectName(name: string): void {
    useSessionStore.getState().setProjectName(name);
  }

  setHistoryFlags(canUndo: boolean, canRedo: boolean): void {
    useSessionStore.getState().setHistoryFlags(canUndo, canRedo);
  }

  setActiveObjectTool(tool: ObjectToolMode | null): void {
    useSessionStore.getState().setActiveObjectTool(tool);
  }
}
