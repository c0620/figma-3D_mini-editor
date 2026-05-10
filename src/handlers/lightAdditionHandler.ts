import type { Light } from '../types/scene';
import { SceneToolHandler } from './sceneToolHandler';

export class LightAdditionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const light = payload as Light;
    this.scene.getScene().lights.push(light);
  }
}
