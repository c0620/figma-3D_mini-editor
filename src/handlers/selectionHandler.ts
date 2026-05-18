import { SceneToolHandler } from "./sceneToolHandler";

export class SelectionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { id } = payload as { id: string | null };
    this.scene.setActive(id);
  }
}
