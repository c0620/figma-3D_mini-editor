import type { SceneEntityKind } from "@/store/sceneEntityList";
import { useSessionStore } from "../store/sessionStore";
import { SceneToolHandler } from "./sceneToolHandler";

export class DeletionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const { modelId, type } = payload as {
      modelId: string;
      type?: Exclude<SceneEntityKind, "camera">;
    };
    this.softDelete(modelId, type);
  }

  softDelete(
    modelId: string,
    type?: Exclude<SceneEntityKind, "camera">
  ): void {
    if (type === "light" || this.scene.findLightById(modelId)) {
      this.scene.patchLight(modelId, { pendingDelete: true, visible: false });
      this.clearSelectionIfActive(modelId);
      return;
    }

    if (type === "mesh" || this.scene.findMeshById(modelId)) {
      this.scene.patchSceneMesh(modelId, {
        pendingDelete: true,
        visible: false,
      });
      this.clearSelectionIfActive(modelId);
    }
  }

  private clearSelectionIfActive(modelId: string): void {
    if (useSessionStore.getState().activeObjectId === modelId) {
      this.scene.setActive(null);
    }
  }
}
