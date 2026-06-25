import { TextureSlot } from "../types/scene";
import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";

export interface TextureExportHandlerPayload {
  materialId: string;
  slot: TextureSlot;
}

export class TextureExportHandler extends SceneToolHandler<
  //toDo
  TextureExportHandlerPayload,
  TextureExportHandlerPayload
> {
  execute(payload: TextureExportHandlerPayload): void {
    void payload;
  }

  getStateBeforeExecute(
    payload: TextureExportHandlerPayload
  ): HistoryEntry<TextureExportHandlerPayload> {
    return { type: CommandType.ExportTexture, snapshot: payload };
  }
}
