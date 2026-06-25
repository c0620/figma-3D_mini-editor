import { TextureSlot } from "../types/scene";
import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";

export interface TextureImportHandlerPayload {
  materialId: string;
  slot: TextureSlot;
  url: string;
}

export class TextureImportHandler extends SceneToolHandler<
  TextureImportHandlerPayload,
  TextureImportHandlerPayload
> {
  execute(payload: TextureImportHandlerPayload): void {
    void payload;
    // if (obj) obj.material.textures.set(slot, url); toDo
  }

  getStateBeforeExecute(
    payload: TextureImportHandlerPayload
  ): HistoryEntry<TextureImportHandlerPayload> {
    return { type: CommandType.ImportTexture, snapshot: payload };
  }
}
