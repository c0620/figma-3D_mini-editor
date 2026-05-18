import { SceneToolHandler } from './sceneToolHandler';

export class DeletionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { modelId } = payload as { modelId: string };
    this.softDelete(modelId);
  }

  softDelete(modelId: string): void {
    this.scene.patchSceneObject(modelId, { pendingDelete: true, visible: false });
  }
}
