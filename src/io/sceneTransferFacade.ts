import { NotificationService } from "../services/alert/notificationService";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { RenderService } from "../render/renderService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { DeviceImportExportService } from "./deviceImportExportService";
import type { ObjectID } from "@/types/scene";
import type { AddLightsWarning, Warning } from "@/services/alert/warnings";
import { OperationContext } from "@/services/alert/operationContext";
import { AppError, CancelError, ErrorCode } from "@/services/alert/errors";
import {
  ExportTypes,
  ImportTypes,
  type DeviceExportFormat,
  type DeviceExportResults,
  type ExportOptions,
  type ExportSceneRequests,
  type ExportSceneResults,
  type FigmaExportResults,
  type ImportSceneRequest,
} from "@/types/io";
import type { TextureService } from "./textureService";
import JSZip from "jszip";
import type { FigmaImportExportService } from "./figmaImportExportService";

export class SceneTransferFacade {
  deviceIO: DeviceImportExportService;
  figmaIO: FigmaImportExportService;
  textureService: TextureService;
  renderService: RenderService;
  analyzer: SceneAnalyzer;
  notifications: NotificationService;
  assetCatalog: AssetCatalogService;
  lastImportTask: OperationContext | null = null;
  lastExportTasks: OperationContext[] = [];

  constructor(
    deviceIO: DeviceImportExportService,
    figmaIO: FigmaImportExportService,
    textureService: TextureService,
    renderService: RenderService,
    analyzer: SceneAnalyzer,
    notifications: NotificationService,
    assetCatalog: AssetCatalogService
  ) {
    this.deviceIO = deviceIO;
    this.figmaIO = figmaIO;
    this.textureService = textureService;
    this.renderService = renderService;
    this.analyzer = analyzer;
    this.notifications = notifications;
    this.assetCatalog = assetCatalog;
  }

  readonly exportScene = async <R extends ExportSceneRequests[ExportTypes]>(
    request: R
  ): Promise<ExportSceneResults[R["to"]] | undefined> => {
    const context = new OperationContext(request.to, this.notifications);
    this.abortPreviousTask(context);

    const options = request.format;

    try {
      if (request.to == ExportTypes.device) {
        const output: DeviceExportResults = {
          png: undefined,
          gltf: undefined,
          zip: undefined,
        };

        if (options.renderOptions.render) {
          output.png = await this.renderService.exportRender(
            options.renderOptions
          );
        }
        if (options.fileOptions.file) {
          output.gltf = await this.deviceIO.exportToDevice(
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
        if (context.isAborted()) throw new CancelError("Context was aborted");
        return output as unknown as ExportSceneResults[R["to"]];
      }
      if (request.to == ExportTypes.figma) {
        if (options.renderOptions.render) {
          const png = await this.renderService.exportRender(
            options.renderOptions
          );
          await this.figmaIO.exportPlainRender(png, [
            options.renderOptions.width,
            options.renderOptions.height,
          ]);
        }
        if (options.figmaOptions.linkedRender) {
          throw new Error("not implemented"); //toDo
        }
        if (
          options.figmaOptions.updateFrames &&
          options.figmaOptions.framesToUpdate.length !== 0
        ) {
          throw new Error("not implemented"); //toDo
        }
        if (context.isAborted()) throw new CancelError("Context was aborted");
        return { success: true } as unknown as ExportSceneResults[R["to"]];
      }
    } catch (error) {
      if (error instanceof AppError) {
        this.notifications.push(error, context.id);
      } else if (error instanceof CancelError) return;
      else console.error(error);
    }
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
