import { NotificationService } from "../services/notificationService";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { RenderService } from "../render/renderService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { SceneImportExportService } from "./sceneImportExportService";
import { TextureFigmaService } from "./textureFigmaService";
import { ScenePersistenceService } from "./scenePersistenceService";
import type { ObjectID } from "@/types/scene";

export type SceneFileType = "OBJ" | "FBX" | "GLB";
export type UploadAction = "LoadScene" | "AddScene";

export type ImportSceneRequest =
  | {
      source: "device";
      type: SceneFileType;
      input: ArrayBuffer | File | string;
      intent: UploadAction;
    }
  | {
      source: "figma";
      frameId: string;
      intent: UploadAction;
    }
  | {
      source: "library";
      assetId: string;
    };

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

  readonly exportSceneToDevice = (type: SceneFileType): Blob => {
    return this.sceneIo.exportToDevice(type);
  };

  readonly importScene = async (
    request: ImportSceneRequest
  ): Promise<ObjectID> => {
    switch (request.source) {
      case "device": {
        const data =
          request.input instanceof File
            ? await request.input.arrayBuffer()
            : request.input;

        switch (request.intent) {
          case "LoadScene":
            return this.sceneIo.importFromDevice(request.type, data);
          case "AddScene":
            return this.sceneIo.addFromDevice(request.type, data);
        }
      }
      case "figma":
        void request.frameId;
        void request.intent;
        throw new Error(
          "SceneTransferFacade.importScene: Figma is not implemented"
        );
      case "library":
        void request.assetId;
        throw new Error(
          "SceneTransferFacade.importScene: library is not implemented"
        );
    }
  };
}
