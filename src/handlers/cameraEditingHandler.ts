import { SceneToolHandler } from './sceneToolHandler';

export class CameraEditingHandler extends SceneToolHandler {
  execute(payload: object): void {
    Object.assign(this.scene.getScene().camera, payload);
  }
}
