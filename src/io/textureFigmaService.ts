import { TextureSlot } from "../types/scene";
import { NotificationService } from "../services/information/notificationService";
import { FigmaHandler } from "../figma/figmaHandler";
import { SceneNamingService } from "./sceneNamingService";

export class TextureFigmaService {
  figmaHandler: FigmaHandler;
  naming: SceneNamingService;

  constructor(figmaHandler: FigmaHandler, naming: SceneNamingService) {
    this.figmaHandler = figmaHandler;
    this.naming = naming;
  }

  exportTextureFrame(textureId: string, materialName: string): string {
    void textureId;
    void materialName;
    return "";
  }

  importTextureFromFrame(
    frameId: string,
    materialId: string,
    slot: TextureSlot
  ): void {
    void frameId;
    void materialId;
    void slot;
  }

  applyFallbackTexture(materialId: string, slot: TextureSlot): void {
    void materialId;
    void slot;
  }
}
