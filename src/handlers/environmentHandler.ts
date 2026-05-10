import { SceneToolHandler } from './sceneToolHandler';

export class EnvironmentHandler extends SceneToolHandler {
  execute(payload: object): void {
    Object.assign(this.scene.getScene().environment, payload);
  }
}
