import { NotificationService } from "../services/information/notificationService";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { RenderService } from "../render/renderService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { DeviceImportExportService } from "./deviceImportExportService";
import { ScenePersistenceService } from "./scenePersistenceService";
import type { ObjectID } from "@/types/scene";
import type {
  AddLightsWarning,
  Warning,
} from "@/services/information/warnings";
import { OperationContext } from "@/services/information/operationContext";
import {
  AppError,
  CancelError,
  ErrorCode,
} from "@/services/information/errors";
import { ImportTypes } from "@/services/information/types";
import type {
  DeviceExportFormat,
  ExportOptions,
  ExportResults,
} from "@/types/io";
import type { TextureService } from "./textureService";
import JSZip from "jszip";

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
  deviceIO: DeviceImportExportService;
  textureService: TextureService;
  persistence: ScenePersistenceService;
  renderService: RenderService;
  analyzer: SceneAnalyzer;
  notifications: NotificationService;
  assetCatalog: AssetCatalogService;
  lastImportTask: OperationContext | null = null;
  lastExportTasks: OperationContext[] = [];

  constructor(
    deviceIO: DeviceImportExportService,
    textureService: TextureService,
    persistence: ScenePersistenceService,
    renderService: RenderService,
    analyzer: SceneAnalyzer,
    notifications: NotificationService,
    assetCatalog: AssetCatalogService
  ) {
    this.deviceIO = deviceIO;
    this.textureService = textureService;
    this.persistence = persistence;
    this.renderService = renderService;
    this.analyzer = analyzer;
    this.notifications = notifications;
    this.assetCatalog = assetCatalog;
  }

  readonly exportSceneToFigmaLinked = (): void => {};

  readonly exportSceneToDevice = async (
    options: ExportOptions
  ): Promise<ExportResults> => {
    const output: ExportResults = {
      png: undefined,
      gltf: undefined,
      zip: undefined,
    };
    if (options.renderOptions.render) {
      output.png = await this.renderService.exportRender(options.renderOptions);
    }
    if (options.fileOptions.file) {
      output.gltf = await this.deviceIO.exportToDevice(
        "GLTF",
        options.fileOptions.onlyVisible
      );
    }
    if (options.fileOptions.appendTextures) {
      const textureURLs = this.textureService.exportTexturesToFile();
      if (textureURLs) {
        const zip = new JSZip();
        textureURLs.forEach((texture) => {
          const index = texture.url.indexOf("base64,") + "base64.".length;
          const content = texture.url.substring(index);
          zip.file(`${texture.name}.png`, content, { base64: true });
        });
        output.zip = await zip.generateAsync({ type: "blob" });
      }
    }
    if (!output.gltf && !output.png && !output.zip) {
      throw new AppError(
        ErrorCode.UnsupportedExportFormat,
        `Unsupported export format`
      );
    }
    return output;
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
              ? await this.deviceIO.importFromDevice(
                  request.type,
                  data,
                  context
                )
              : await this.deviceIO.addFromDevice(request.type, data, context);

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
