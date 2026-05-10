import { TextureSlot } from '../types/scene';
import { NotificationService } from '../store/notificationService';
import { FigmaHandler } from '../figma/figmaHandler';
import { SceneNamingService } from './sceneNamingService';

export class TextureFigmaService {
  figmaHandler: FigmaHandler;
  naming: SceneNamingService;
  notifications: NotificationService;

  constructor(
    figmaHandler: FigmaHandler,
    naming: SceneNamingService,
    notifications: NotificationService,
  ) {
    this.figmaHandler = figmaHandler;
    this.naming = naming;
    this.notifications = notifications;
  }

  exportTextureFrame(textureId: string, materialName: string): string {
    void textureId;
    void materialName;
    return '';
  }

  importTextureFromFrame(frameId: string, materialId: string, slot: TextureSlot): void {
    void frameId;
    void materialId;
    void slot;
  }

  applyFallbackTexture(materialId: string, slot: TextureSlot): void {
    void materialId;
    void slot;
  }
}
