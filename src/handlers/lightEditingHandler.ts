import type { LightPatch } from '../store/sceneStore';
import { SceneToolHandler } from './sceneToolHandler';

export class LightEditingHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { id, changes } = payload as { id: string; changes: LightPatch };
    this.scene.patchLight(id, changes);
  }
}
