import type { Scene } from "../types/scene";

export class SceneStorage {
  scene!: Scene;
  projectName: string = "";
  activeObjectId: string | null = null;

  load(scene: Scene): void {
    this.scene = scene;
  }

  getScene(): Scene {
    return this.scene;
  }

  setActive(id: string | null): void {
    this.activeObjectId = id;
  }

  updateProjectName(name: string): void {
    this.projectName = name;
  }
}
