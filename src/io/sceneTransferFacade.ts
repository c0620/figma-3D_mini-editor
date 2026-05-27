import { downloadBlob, sanitizeExportBasename } from "../lib/download";
import { base64ToUint8Array } from "../lib/base64";
import { downloadSceneTextures } from "./textureExportHelper";
import { isFigmaPlugin } from "../figma/figmaApi";
import type { LinkedSelectionSummary } from "../figma/figmaMessages";
import { useSessionStore } from "../store/sessionStore";
import { normalizeCameraState } from "../types/scene";
import type {
  DeviceExportOptions,
  FigmaExportOptions,
  SceneExportOptions,
} from "../types/export";
import { NotificationService } from "../store/notificationService";
import { SceneAnalyzer } from "../render/sceneAnalyzer";
import { RenderService } from "../render/renderService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { SceneImportExportService } from "./sceneImportExportService";
import type { SceneImportResources } from "./sceneImportExportService";
import { TextureFigmaService } from "./textureFigmaService";
import { ScenePersistenceService } from "./scenePersistenceService";

export type SceneFileType = "OBJ" | "FBX" | "GLB";

export type { SceneImportResources, SceneExportOptions };

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

  readonly exportSceneToFigmaLinked = async (
    options: FigmaExportOptions
  ): Promise<void> => {
    await this.exportToFigma(options);
  };

  readonly findFigmaSceneRenders = async (
    sceneId: string,
    projectName: string
  ) => {
    return this.persistence.findSceneRenders(sceneId, projectName);
  };

  readonly exportToFigma = async (
    options: FigmaExportOptions
  ): Promise<void> => {
    if (!isFigmaPlugin()) {
      this.notifications.pushError(
        "Экспорт в Figma недоступен",
        "Откройте редактор как плагин Figma"
      );
      return;
    }

    const scene = this.sceneIo.scene.getScene();
    if (!scene) {
      this.notifications.pushError(
        "Не удалось экспортировать сцену",
        "Сцена не загружена"
      );
      return;
    }

    const projectName = useSessionStore.getState().projectName;
    const frameName = this.persistence.naming.buildRenderName(
      sanitizeExportBasename(projectName, scene.id)
    );

    try {
      const { png } = await this.renderService.exportRender({
        width: options.width,
        height: options.height,
        transparentBackground: options.transparentBackground,
      });
      const pngBytes = new Uint8Array(await png.arrayBuffer());

      let glb: ArrayBuffer | undefined;
      if (options.linkedRender) {
        const glbBlob = await this.sceneIo.exportToDevice("GLB", {
          includeCamera: true,
          includeTextures: false,
        });
        glb = await glbBlob.arrayBuffer();
      }

      await this.persistence.exportRenderFrame({
        frameName,
        width: options.width,
        height: options.height,
        pngBytes,
        scene,
        projectName: sanitizeExportBasename(projectName, scene.id),
        linkedRender: options.linkedRender,
        glb,
      });

      this.notifications.pushSuccess("Сцена сохранена как связанный рендер");
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Неизвестная ошибка экспорта";
      this.notifications.pushError("Не удалось экспортировать в Figma", reason);
    }
  };

  readonly subscribeFigmaLinkedSelection = (
    listener: (frame: LinkedSelectionSummary | null) => void
  ): (() => void) => {
    return this.persistence.subscribeLinkedSelection(listener);
  };

  readonly importSceneFromFigma = async (frameId?: string): Promise<void> => {
    if (!isFigmaPlugin()) {
      this.notifications.pushError(
        "Импорт из Figma недоступен",
        "Откройте редактор как плагин Figma"
      );
      return;
    }

    try {
      let resolvedFrameId = frameId;
      if (!resolvedFrameId) {
        const selection = await this.persistence.getLinkedSelection();
        if (!selection) {
          this.notifications.pushError(
            "Не удалось импортировать сцену",
            "Выберите фрейм со связанным рендером"
          );
          return;
        }
        resolvedFrameId = selection.frameId;
      }

      const data = await this.persistence.restoreLinkedSceneData(resolvedFrameId);
      const glbBuffer = base64ToUint8Array(data.glbBase64).buffer;

      await this.sceneIo.importFromDevice("GLB", glbBuffer);
      this.sceneIo.scene.patchCamera(normalizeCameraState(data.camera));
      useSessionStore.getState().setProjectName(data.projectName);

      this.notifications.pushSuccess("Сцена импортирована");
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Неизвестная ошибка импорта";
      this.notifications.pushError("Не удалось импортировать сцену", reason);
      throw error;
    }
  };

  readonly exportSceneToDevice = async (
    type: SceneFileType,
    options?: SceneExportOptions
  ): Promise<Blob> => {
    return this.sceneIo.exportToDevice(type, options);
  };

  readonly exportToDevice = async (
    options: DeviceExportOptions
  ): Promise<void> => {
    const scene = this.sceneIo.scene.getScene();
    if (!scene) {
      this.notifications.pushError(
        "Не удалось экспортировать сцену",
        "Сцена не загружена"
      );
      return;
    }

    const projectName = useSessionStore.getState().projectName;
    const baseName = sanitizeExportBasename(projectName, scene.id);

    try {
      if (options.exportScene) {
        const sceneOptions: SceneExportOptions = {
          includeTextures: options.includeTextures,
          includeCamera: options.includeCamera,
        };
        const blob = await this.sceneIo.exportToDevice("GLB", sceneOptions);
        downloadBlob(blob, `${baseName}.glb`);

        if (options.includeTextures) {
          await downloadSceneTextures(scene, baseName);
        }
      }

      if (options.exportImage) {
        const { png } = await this.renderService.exportRender({
          width: options.width,
          height: options.height,
          transparentBackground: options.transparentBackground,
        });
        downloadBlob(png, `${baseName}.png`);
      }

      this.notifications.pushSuccess("Экспорт завершён");
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Неизвестная ошибка экспорта";
      this.notifications.pushError("Не удалось экспортировать сцену", reason);
    }
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
