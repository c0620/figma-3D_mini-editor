import { SceneToolHandler } from './sceneToolHandler';

export class DeletionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { modelId } = payload as { modelId: string };
    this.softDelete(modelId);
  }

  softDelete(modelId: string): void {
    const obj = this.scene.getScene().objects.find((o) => o.id === modelId);
    if (obj) obj.pendingDelete = true;
  }
}
