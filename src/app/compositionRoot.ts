import { CommandType } from "../types/commands";
import type { Light, TextureSlot } from "../types/scene";
import { FigmaAPI } from "../figma/figmaApi";
import { FigmaHandler } from "../figma/figmaHandler";
import { BaseToolHandler } from "../handlers/baseToolHandler";
import { CameraEditingHandler } from "../handlers/cameraEditingHandler";
import { DeletionHandler } from "../handlers/deletionHandler";
import { EnvironmentHandler } from "../handlers/environmentHandler";
import { LightAdditionHandler } from "../handlers/lightAdditionHandler";
import { LightEditingHandler } from "../handlers/lightEditingHandler";
import { SelectionHandler } from "../handlers/selectionHandler";
import { TextureExportHandler } from "../handlers/textureExportHandler";
import { TextureImportHandler } from "../handlers/textureImportHandler";
import {
  ObjectGraphToolsHandler,
  ToggleLockHandler,
  ToggleVisibilityHandler,
} from "../handlers/objectModeChangingHandler";
import { SceneEncoder } from "../io/sceneEncoder";
import { SceneImportExportService } from "../io/sceneImportExportService";
import { SceneNamingService } from "../io/sceneNamingService";
import { ScenePersistenceService } from "../io/scenePersistenceService";
import { SceneTransferFacade } from "../io/sceneTransferFacade";
import { TextureFigmaService } from "../io/textureFigmaService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { Renderer } from "../render/renderer";
import { RenderService } from "../render/renderService";
import { SceneAnalyzer } from "../render/sceneAnalyzer";
import { LocalizationService } from "../services/localizationService";
import enBundle from "../i18n/en";
import ruBundle from "../i18n/ru";
import { HelpService } from "../services/helpService";
import { MaterialPreviewService } from "../services/previewService";
import { TooltipService } from "../services/tooltipService";
import { ActionExecutor } from "../commands/actionExecutor";
import { ActionReverter } from "../commands/actionReverter";
import { CommandBus } from "../commands/commandBus";
import { DeletionGarbageCollector } from "../commands/deletionGarbageCollector";
import { History } from "../store/history";
import { NotificationService } from "../store/notificationService";
import { useSceneStore } from "../store/sceneStore";
import { SceneStorage } from "../store/sceneStorage";

import type { SceneEntitySummary } from "../store/sceneEntityList";
import { buildSceneEntityList } from "../store/sceneEntityList";
import { MaterialEditingHandler } from "@/handlers/materialEditingHandler";

/**
 * Proxy-тип для хэндлеров, команды которых идут через CommandBus (с историей).
 * С точки зрения молекулы интерфейс идентичен прямым хэндлерам.
 */
type HandlerProxy<P extends object = object> = {
  execute(payload: P): void;
};

export interface AppHandlers {
  /** Выделение объекта — без истории, вызывается напрямую */
  selection: SelectionHandler;
  /** Видимость/блокировка мешей: см. {@link ObjectGraphToolsHandler.execute} */
  graphTools: ObjectGraphToolsHandler;
  /** Управление камерой — без истории, вызывается напрямую */
  camera: CameraEditingHandler;
  /** Базовый трансформ (заглушка до реализации TransformObjectHandler) */
  base: BaseToolHandler;

  /** Ниже — прокси через CommandBus, действия записываются в историю */
  deletion: HandlerProxy<{ modelId: string }>;
  visibility: HandlerProxy<{ id: string | null }>;
  lock: HandlerProxy<{ id: string }>;
  materialEditing: HandlerProxy<{ id: string; changes: object }>;
  lightAddition: HandlerProxy<Light>;
  lightEditing: HandlerProxy<{ id: string; changes: object }>;
  background: HandlerProxy<{ backgroundColor: string | null }>;
  shadows: HandlerProxy<{ shadowsEnabled: boolean }>;
  sceneRename: HandlerProxy<{ name: string }>;
  textureImport: HandlerProxy<{
    materialId: string;
    slot: TextureSlot;
    url: string;
  }>;
  textureExport: HandlerProxy<{ materialId: string; slot: TextureSlot }>;
  environment: EnvironmentHandler;
}

export interface AppKernel {
  handlers: AppHandlers;
  undo(): void;
  redo(): void;
  listSceneEntities(): SceneEntitySummary[];
  transfer: SceneTransferFacade;
  notifications: NotificationService;
  help: HelpService;
  tooltips: TooltipService;
  i18n: LocalizationService;
  preview: MaterialPreviewService;
}

export function buildKernel(): AppKernel {
  // --- Infrastructure ---
  const figmaApi = new FigmaAPI();
  const figmaHandler = new FigmaHandler(figmaApi);
  const naming = new SceneNamingService();
  const encoder = new SceneEncoder();
  const renderer = new Renderer();

  // --- State ---
  const sceneStorage = new SceneStorage();
  const notifications = new NotificationService();
  const history = new History();

  // --- Render / Analytics ---
  const renderService = new RenderService(renderer, sceneStorage);
  const analyzer = new SceneAnalyzer();

  // --- IO ---
  const sceneIo = new SceneImportExportService(
    encoder,
    sceneStorage,
    analyzer,
    notifications
  );
  const textureFigma = new TextureFigmaService(
    figmaHandler,
    naming,
    notifications
  );
  const persistence = new ScenePersistenceService(figmaHandler, naming);
  const assetCatalog = new AssetCatalogService(sceneStorage);
  const transfer = new SceneTransferFacade(
    sceneIo,
    textureFigma,
    persistence,
    renderService,
    analyzer,
    notifications,
    assetCatalog
  );

  // --- UX services ---
  const i18n = new LocalizationService();
  i18n.addBundle("en", enBundle);
  i18n.addBundle("ru", ruBundle);

  const tooltips = new TooltipService(i18n);
  const help = new HelpService(i18n, tooltips);
  const preview = new MaterialPreviewService(128);

  // --- Tool handlers ---
  const baseHandler = new BaseToolHandler(sceneStorage);
  const selectionHandler = new SelectionHandler(sceneStorage);
  const deletionHandler = new DeletionHandler(sceneStorage);
  const cameraHandler = new CameraEditingHandler(sceneStorage);
  const lightAdditionHandler = new LightAdditionHandler(sceneStorage);
  const lightEditingHandler = new LightEditingHandler(sceneStorage);
  const environmentHandler = new EnvironmentHandler(sceneStorage);
  const textureImportHandler = new TextureImportHandler(sceneStorage);
  const textureExportHandler = new TextureExportHandler(sceneStorage);
  const graphToolsHandler = new ObjectGraphToolsHandler(sceneStorage);
  const toggleVisibilityHandler = new ToggleVisibilityHandler(sceneStorage);
  const toggleLockHandler = new ToggleLockHandler(sceneStorage);
  const materialEditingHandler = new MaterialEditingHandler(sceneStorage);

  // --- Commands ---
  const executor = new ActionExecutor(sceneStorage);
  const reverter = new ActionReverter(sceneStorage);
  const gc = new DeletionGarbageCollector(sceneStorage);
  const bus = new CommandBus(history, executor, reverter, gc);

  executor.handlers.set(CommandType.DeleteModel, deletionHandler);
  executor.handlers.set(CommandType.AddLight, lightAdditionHandler);
  executor.handlers.set(CommandType.EditLight, lightEditingHandler);
  executor.handlers.set(CommandType.EditCamera, cameraHandler);
  executor.handlers.set(CommandType.SetBackground, environmentHandler);
  executor.handlers.set(CommandType.ToggleShadows, environmentHandler);
  executor.handlers.set(CommandType.ImportTexture, textureImportHandler);
  executor.handlers.set(CommandType.ExportTexture, textureExportHandler);
  executor.handlers.set(CommandType.ToggleVisibility, toggleVisibilityHandler);
  executor.handlers.set(CommandType.ToggleLock, toggleLockHandler);
  executor.handlers.set(CommandType.EditMaterial, materialEditingHandler);
  // SelectObject вызывается напрямую через selectionHandler, минуя bus
  // TransformObject, ToggleVisibility, ToggleLock, RenameScene — TBD

  // --- Сборка handlers-объекта для UI ---
  const makeProxy = <P extends object>(type: CommandType): HandlerProxy<P> => ({
    execute: (payload: P) => bus.execute(type, payload),
  });

  const handlers: AppHandlers = {
    selection: selectionHandler,
    graphTools: graphToolsHandler,
    camera: cameraHandler,
    base: baseHandler,
    environment: environmentHandler,

    deletion: makeProxy(CommandType.DeleteModel),
    visibility: makeProxy(CommandType.ToggleVisibility),
    lock: makeProxy(CommandType.ToggleLock),
    lightAddition: makeProxy(CommandType.AddLight),
    lightEditing: makeProxy(CommandType.EditLight),
    background: makeProxy(CommandType.SetBackground),
    shadows: makeProxy(CommandType.ToggleShadows),
    sceneRename: makeProxy(CommandType.RenameScene),
    textureImport: makeProxy(CommandType.ImportTexture),
    textureExport: makeProxy(CommandType.ExportTexture),
    materialEditing: makeProxy(CommandType.EditMaterial),
  };

  return {
    handlers,
    undo: () => bus.undo(),
    redo: () => bus.redo(),
    listSceneEntities: () =>
      buildSceneEntityList(useSceneStore.getState().scene, (k) => i18n.t(k)),
    transfer,
    notifications,
    help,
    tooltips,
    i18n,
    preview,
  };
}
