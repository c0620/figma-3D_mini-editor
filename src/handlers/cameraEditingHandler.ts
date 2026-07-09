import type { SceneCamera } from "@/types/scene";
import type { CameraPatch } from "../store/sceneStore";
import { SceneToolHandler } from "./sceneToolHandler";
import { CommandType, type HistoryEntry } from "@/types/commands";

export interface CameraEditingHandlerPayload extends CameraPatch {}

export class CameraEditingHandler extends SceneToolHandler<
  CameraEditingHandlerPayload,
  SceneCamera
> {
  execute(payload: CameraEditingHandlerPayload): void {
    this.scene.patchCamera(payload as CameraPatch);
  }

  getStateBeforeExecute(
    payload: CameraEditingHandlerPayload
  ): HistoryEntry<SceneCamera> {
    const { id } = payload;
    var camera;
    if (id) camera = this.scene.findCameraById(id);
    if (!id || !camera)
      throw new Error(
        "getStateBeforeExecute(cameraEditingHandler): no id/camera to revert"
      );
    return { type: CommandType.EditCamera, snapshot: camera };
  }
}
