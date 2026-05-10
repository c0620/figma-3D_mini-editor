import { SceneToolHandler } from './sceneToolHandler';

export class LightEditingHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { id, changes } = payload as { id: string; changes: object };
    const light = this.scene.getScene().lights.find((l) => l.id === id);
    if (light) Object.assign(light, changes);
  }
}
