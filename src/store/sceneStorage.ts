import type {
  CameraState,
  Light,
  Material,
  Scene,
  SceneMesh,
} from "../types/scene";

import { useSceneStore } from "./sceneStore";
import type {
  CameraPatch,
  LightPatch,
  MaterialPatch,
  SceneObjectPatch,
} from "./sceneStore";
import { useSessionStore } from "./sessionStore";

export class SceneStorage {
  load(scene: Scene): void {
    useSceneStore.getState().loadScene(scene);
  }

  getScene(): Scene {
    const scene = useSceneStore.getState().scene;
    if (!scene) throw new Error("SceneStorage.getScene: no scene loaded");
    return scene;
  }

  getStaticMeshMaterials(mesh: SceneMesh): Material[] {
    const scene = useSceneStore.getState().scene;
    if (!scene)
      throw new Error("SceneStorage.getMeshMaterials: no scene loaded");
    return mesh.materialIDs.map((id) => scene.materials[id]);
  }

  patchSceneMesh(objectId: string, patch: SceneObjectPatch): void {
    useSceneStore.getState().patchSceneObject(objectId, patch);
  }

  patchLight(lightId: string, patch: LightPatch): void {
    useSceneStore.getState().patchLight(lightId, patch);
  }

  patchCamera(patch: CameraPatch): void {
    useSceneStore.getState().patchCamera(patch);
  }

  patchMaterial(materialId: string, patch: MaterialPatch): void {
    useSceneStore.getState().patchMaterial(materialId, patch);
  }

  findMeshById(id: string): SceneMesh | null {
    const scene = useSceneStore.getState().scene;
    if (!scene) return null;
    return scene.meshes.find((o) => o.id === id) ?? null;
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
    useSessionStore.getState().setActiveObjectId(id);
  }

  updateProjectName(name: string): void {
    useSessionStore.getState().setProjectName(name);
  }
}
