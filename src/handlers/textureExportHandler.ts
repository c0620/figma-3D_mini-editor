import { CommandType, type HistoryEntry } from "@/types/commands";
import { TextureSlot } from "../types/scene";
import { SceneToolHandler } from "./sceneToolHandler";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import { TextureLocalService } from "@/io/textureLocalService";
import { TextureFigmaService } from "@/io/textureFigmaService";
import { SceneStorage } from "@/store/sceneStorage";

export type TextureExportPayload = {
  materialId: string;
  slot: TextureSlot;
  target: "local" | "figma";
};

export class TextureExportHandler extends SceneToolHandler<
  TextureExportPayload,
  TextureExportPayload
> {
  local: TextureLocalService;
  figma: TextureFigmaService;

  constructor(
    scene: SceneStorage,
    local: TextureLocalService,
    figma: TextureFigmaService
  ) {
    super(scene);
    this.local = local;
    this.figma = figma;
  }

  execute(payload: TextureExportPayload): void {
    const texture =
      threeAssetRegistry.materials[payload.materialId].material[payload.slot];
    if (!texture) return;

    const material = this.scene.getMaterial(payload.materialId);
    const name = material?.name ?? "material";

    if (payload.target === "local") {
      this.local.exportTextureToFile(texture, `${name}_${payload.slot}.png`);
      return;
    }

    this.figma.exportTextureFrame(texture.uuid, name);
  }

  getStateBeforeExecute(payload: TextureExportPayload): HistoryEntry<TextureExportPayload> {
    return { type: CommandType.ExportTexture, snapshot: payload };
  }
}
