import { NotificationService } from "../store/notificationService";
import { SceneAnalyzer } from "../render/sceneAnalyzer";
import { RenderService } from "../render/renderService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { SceneImportExportService } from "./sceneImportExportService";
import { TextureFigmaService } from "./textureFigmaService";
import { ScenePersistenceService } from "./scenePersistenceService";

type SceneFileType = "OBJ" | "FBX" | "GLB";

export class SceneTransferFacade {
  sceneIo: SceneImportExportService;
  textureFigma: TextureFigmaService;
  persistence: ScenePersistenceService;
  renderService: RenderService;
  analyzer: SceneAnalyzer;
  notifications: NotificationService;
  assetCatalog: AssetCatalogService;

  constructor(
    sceneIo: SceneImportExportService,
    textureFigma: TextureFigmaService,
    persistence: ScenePersistenceService,
    renderService: RenderService,
    analyzer: SceneAnalyzer,
    notifications: NotificationService,
    assetCatalog: AssetCatalogService
  ) {
    this.sceneIo = sceneIo;
    this.textureFigma = textureFigma;
    this.persistence = persistence;
    this.renderService = renderService;
    this.analyzer = analyzer;
    this.notifications = notifications;
    this.assetCatalog = assetCatalog;
  }

  exportSceneToFigmaLinked(): void {}

  importSceneFromFigma(frameId: string): void {
    void frameId;
  }

  exportSceneToDevice(type: SceneFileType): Blob {
    return this.sceneIo.exportToDevice(type);
  }

  importSceneFromDevice(type: SceneFileType, input: string): void {
    this.sceneIo.importFromDevice(type, input);
  }
}
