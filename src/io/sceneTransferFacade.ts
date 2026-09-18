import { NotificationService } from "../services/information/notificationService";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { RenderService } from "../render/renderService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { SceneImportExportService } from "./sceneImportExportService";
import { TextureFigmaService } from "./textureFigmaService";
import { ScenePersistenceService } from "./scenePersistenceService";
import type { ObjectID } from "@/types/scene";
import type {
  AddLightsWarning,
  Warning,
} from "@/services/information/warnings";
import { OperationContext } from "@/services/information/operationContext";
import { AppError, CancelError } from "@/services/information/errors";
import { ImportTypes } from "@/services/information/types";

export type SceneFileType = "OBJ" | "FBX" | "GLB";
export type UploadAction = "LoadScene" | "AddScene";

export type ImportSceneRequest =
  | {
      source: ImportTypes.device;
      type: SceneFileType;
      input: ArrayBuffer | File | string;
      intent: UploadAction;
    }
  | {
      source: ImportTypes.figma;
      frameId: string;
      intent: UploadAction;
    }
  | {
      source: ImportTypes.library;
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
  lastImportTask: OperationContext | null = null;
  lastExportTasks: OperationContext[] = [];

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

  private abortPreviousTask(context: OperationContext) {
    if (this.lastImportTask?.ofType == context.ofType) {
      this.lastImportTask.abort();
    }
    this.lastImportTask = context;
  }

  readonly importScene = async (
    request: ImportSceneRequest
  ): Promise<ObjectID | undefined> => {
    const context = new OperationContext(request.source, this.notifications);
    this.abortPreviousTask(context);

    try {
      switch (request.source) {
        case ImportTypes.device: {
          const data =
            request.input instanceof File
              ? await request.input.arrayBuffer()
              : request.input;

          const result =
            request.intent === "LoadScene"
              ? await this.sceneIo.importFromDevice(request.type, data, context)
              : await this.sceneIo.addFromDevice(request.type, data, context);

          if (!context.isAborted()) {
            context.pushLogs();
          }

          return context.isAborted() ? undefined : result?.id;
        }
        case ImportTypes.figma: {
          void request.frameId;
          void request.intent;
          throw new Error(
            "SceneTransferFacade.importScene: Figma is not implemented"
          );
          break;
        }
        case ImportTypes.library: {
          void request.assetId;
          throw new Error(
            "SceneTransferFacade.importScene: library is not implemented"
          );
        }
      }
    } catch (error) {
      if (error instanceof AppError) {
        this.notifications.push(error, context.id);
      } else if (error instanceof CancelError) return;
      else console.error(error);
    }
  };
}
