import type { EnvironmentPatch } from "../store/sceneStore";
import { SceneToolHandler } from "./sceneToolHandler";

export class EnvironmentHandler extends SceneToolHandler {
  execute(payload: object): void {
    this.scene.patchEnvironment(payload as EnvironmentPatch);
  }
  getStateBeforeExecute(payload: object) {
    return this.scene.getEnvironment();
  }
}
