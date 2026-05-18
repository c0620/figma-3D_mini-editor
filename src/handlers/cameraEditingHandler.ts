import type { CameraPatch } from '../store/sceneStore';
import { SceneToolHandler } from './sceneToolHandler';

export class CameraEditingHandler extends SceneToolHandler {
  execute(payload: object): void {
    this.scene.patchCamera(payload as CameraPatch);
  }
}
