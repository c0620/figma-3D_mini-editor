import { CommandType } from "../types/commands";
import type { EnvironmentState, SceneLight, TextureSlot } from "../types/scene";
import { FigmaAPI } from "../figma/figmaApi";
import { FigmaHandler } from "../figma/figmaHandler";
import {
  TransformObjectHandler,
  type TransformObjectHandlerPayload,
} from "../handlers/transformObjectHandler";
import { CameraEditingHandler } from "../handlers/cameraEditingHandler";
import {
  DeletionHandler,
  type DeletionHandlerPayload,
} from "../handlers/deletionHandler";
import { EnvironmentHandler } from "../handlers/environmentHandler";
import { LightAdditionHandler } from "../handlers/lightAdditionHandler";
import {
  LightEditingHandler,
  type LightEditingPayload,
} from "../handlers/lightEditingHandler";
import { SelectionHandler } from "../handlers/selectionHandler";
import { TextureExportHandler } from "../handlers/textureExportHandler";
import { TextureImportHandler } from "../handlers/textureImportHandler";
import {
  ObjectGraphToolsHandler,
  ToggleLockHandler,
  ToggleVisibilityHandler,
  type ToggleLockPayload,
  type ToggleVisibilityPayload,
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
import { HelpService } from "../services/helpService";
import { TooltipService } from "../services/tooltipService";
import { ActionExecutor } from "../commands/actionExecutor";
import { CommandBus } from "../commands/commandBus";
import { DeletionGarbageCollector } from "../commands/deletionGarbageCollector";
import { History } from "../store/history";
import { NotificationService } from "../store/notificationService";
import { SceneStorage } from "../store/sceneStorage";

import type { SceneEntitySummary } from "../store/sceneEntityList";
import { buildSceneEntityList } from "../store/sceneEntityList";

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

  /** Ниже — прокси через CommandBus, действия записываются в историю */
  transform: HandlerProxy<TransformObjectHandlerPayload>;
  deletion: HandlerProxy<DeletionHandlerPayload>;
  visibility: HandlerProxy<ToggleVisibilityPayload>;
  lock: HandlerProxy<ToggleLockPayload>;
  lightAddition: HandlerProxy<SceneLight>;
  lightEditing: HandlerProxy<LightEditingPayload>;
  background: HandlerProxy<EnvironmentState>; //too Narrow
  shadows: HandlerProxy<EnvironmentState>; //too Narrow
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
  /** Текущее содержимое сцены для дерева и выбора активного объекта (снимок на момент вызова). */
  listSceneEntities(): SceneEntitySummary[];
  transfer: SceneTransferFacade;
  notifications: NotificationService;
  help: HelpService;
  tooltips: TooltipService;
  i18n: LocalizationService;
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
  const tooltips = new TooltipService(i18n);
  const help = new HelpService(i18n, tooltips);

  // --- Tool handlers ---
  const transformHandler = new TransformObjectHandler(sceneStorage);
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

  // --- Commands ---
  const executor = new ActionExecutor(sceneStorage);
  const gc = new DeletionGarbageCollector(sceneStorage);
  const bus = new CommandBus(sceneStorage, history, executor, gc);

  executor.handlers.set(CommandType.TransformObject, transformHandler);
  executor.handlers.set(CommandType.DeleteObject, deletionHandler);
  executor.handlers.set(CommandType.AddLight, lightAdditionHandler);
  executor.handlers.set(CommandType.EditLight, lightEditingHandler);
  executor.handlers.set(CommandType.EditCamera, cameraHandler);
  executor.handlers.set(CommandType.SetBackground, environmentHandler);
  executor.handlers.set(CommandType.ToggleShadows, environmentHandler);
  executor.handlers.set(CommandType.ImportTexture, textureImportHandler);
  executor.handlers.set(CommandType.ExportTexture, textureExportHandler);
  executor.handlers.set(CommandType.ToggleVisibility, toggleVisibilityHandler);
  executor.handlers.set(CommandType.ToggleLock, toggleLockHandler);

  // SelectObject вызывается напрямую через selectionHandler, минуя bus
  // EditMaterial, ToggleLock, RenameScene — TBD

  // --- Сборка handlers-объекта для UI ---
  const makeProxy = <P extends object>(type: CommandType): HandlerProxy<P> => ({
    execute: (payload: P) => bus.execute(type, payload),
  });

  const handlers: AppHandlers = {
    selection: selectionHandler,
    graphTools: graphToolsHandler,
    camera: cameraHandler,

    environment: environmentHandler,

    transform: makeProxy(CommandType.TransformObject),
    deletion: makeProxy(CommandType.DeleteObject),
    visibility: makeProxy(CommandType.ToggleVisibility),
    lock: makeProxy(CommandType.ToggleLock),
    lightAddition: makeProxy(CommandType.AddLight),
    lightEditing: makeProxy(CommandType.EditLight),
    background: makeProxy(CommandType.SetBackground),
    shadows: makeProxy(CommandType.ToggleShadows),
    sceneRename: makeProxy(CommandType.RenameScene),
    textureImport: makeProxy(CommandType.ImportTexture),
    textureExport: makeProxy(CommandType.ExportTexture),
  };

  return {
    handlers,
    undo: () => bus.undo(),
    redo: () => bus.redo(),
    listSceneEntities: () =>
      buildSceneEntityList(sceneStorage.getSceneOrNull()),
    transfer,
    notifications,
    help,
    tooltips,
    i18n,
  };
}
