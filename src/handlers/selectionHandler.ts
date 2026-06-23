import { SceneToolHandler } from "./sceneToolHandler";

export class SelectionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { id } = payload as { id: string | null };
    const newObject = id ? this.scene.getScene().sceneGraph.objects[id] : null;
    const newRef = newObject
      ? { id: id as string, kind: newObject.kind }
      : null;
    this.scene.setActiveObjectId(newRef);
  }

  getStateBeforeExecute(payload: object) {}
}
