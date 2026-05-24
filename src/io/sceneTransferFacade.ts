import { NotificationService } from "../store/notificationService";
import { SceneAnalyzer } from "../render/sceneAnalyzer";
import { RenderService } from "../render/renderService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { SceneImportExportService } from "./sceneImportExportService";
import type { SceneImportResources } from "./sceneImportExportService";
import { TextureFigmaService } from "./textureFigmaService";
import { ScenePersistenceService } from "./scenePersistenceService";

export type SceneFileType = "OBJ" | "FBX" | "GLB";

export type { SceneImportResources };

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

  readonly exportSceneToFigmaLinked = (): void => {};

  readonly importSceneFromFigma = (frameId: string): void => {
    void frameId;
  };

  readonly exportSceneToDevice = (type: SceneFileType): Blob => {
    return this.sceneIo.exportToDevice(type);
  };

  readonly importSceneFromDevice = async (
    type: SceneFileType,
    input: ArrayBuffer | File | string,
    resources?: SceneImportResources
  ): Promise<void> => {
    const data = input instanceof File ? await input.arrayBuffer() : input;
    await this.sceneIo.importFromDevice(type, data, resources);
  };
}
