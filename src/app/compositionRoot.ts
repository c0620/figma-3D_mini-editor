import { CommandType } from "../types/commands";
import type { EnvironmentState, SceneLight } from "../types/scene";
import { FigmaAPI } from "../figma/figmaApi";
import { FigmaHandler } from "../figma/figmaHandler";
import {
  TransformObjectHandler,
  type TransformObjectHandlerPayload,
} from "../handlers/transformObjectHandler";
import {
  CameraEditingHandler,
  type CameraEditingHandlerPayload,
} from "../handlers/cameraEditingHandler";
import {
  DeletionHandler,
  type DeletionHandlerPayload,
} from "../handlers/deletionHandler";
import { EnvironmentHandler } from "../handlers/environmentHandler";
import {
  ObjectAdditionHandler,
  type ObjectAdditionHandlerPayload,
} from "../handlers/objectAdditionHandler";
import {
  LightEditingHandler,
  type LightEditingPayload,
} from "../handlers/lightEditingHandler";
import { SelectionHandler } from "../handlers/selectionHandler";
import {
  TextureExportHandler,
  type TextureExportPayload,
} from "../handlers/textureExportHandler";
import {
  TextureImportHandler,
  type TextureImportPayload,
} from "../handlers/textureImportHandler";
import {
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
import { TextureLocalService } from "../io/textureLocalService";
import { AssetCatalogService } from "../library/assetCatalogService";
import { Renderer } from "../render/renderer";
import { RenderService } from "../render/renderService";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { LocalizationService } from "../services/localizationService";
import { HelpService } from "../services/helpService";
import { TooltipService } from "../services/tooltipService";
import { ActionExecutor } from "../commands/actionExecutor";
import { CommandBus } from "../commands/commandBus";
import { DeletionGarbageCollector } from "../commands/deletionGarbageCollector";
import { History } from "../store/history";
import { NotificationService } from "../services/notificationService";
import { SceneStorage } from "../store/sceneStorage";

import type { SceneEntitySummary } from "../store/sceneEntityList";
import { buildSceneEntityList } from "../store/sceneEntityList";
import {
  MaterialEditingHandler,
  type MaterialEditingPayload,
} from "@/handlers/materialEditingHandler";

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
  /** Ниже — прокси через CommandBus, действия записываются в историю */
  camera: HandlerProxy<CameraEditingHandlerPayload>;
  transform: HandlerProxy<TransformObjectHandlerPayload>;
  materialEditing: HandlerProxy<MaterialEditingPayload>;
  deletion: HandlerProxy<DeletionHandlerPayload>;
  visibility: HandlerProxy<ToggleVisibilityPayload>;
  lock: HandlerProxy<ToggleLockPayload>;
  objectAddition: HandlerProxy<ObjectAdditionHandlerPayload>;
  lightEditing: HandlerProxy<LightEditingPayload>;
  background: HandlerProxy<EnvironmentState>; //too Narrow
  shadows: HandlerProxy<EnvironmentState>; //too Narrow
  sceneRename: HandlerProxy<{ name: string }>;
  textureImport: HandlerProxy<TextureImportPayload>;
  textureExport: (payload: TextureExportPayload) => void;
  environment: EnvironmentHandler;
}

export interface AppKernel {
  handlers: AppHandlers;
  undo(): void;
  redo(): void;
  /** Текущее содержимое сцены для дерева и выбора активного объекта (снимок на момент вызова). */
  listSceneEntities(): SceneEntitySummary[];
  transfer: SceneTransferFacade;
  renderService: RenderService;
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
  sceneStorage.setOnClear(() => renderService.disposeMaterialPreview());
  const analyzer = new SceneAnalyzer();

  // --- IO ---
  const sceneIo = new SceneImportExportService(
    encoder,
    sceneStorage,
    analyzer,
    notifications
  );
  const textureLocal = new TextureLocalService();
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
  const materialEditingHandler = new MaterialEditingHandler(sceneStorage);
  const selectionHandler = new SelectionHandler(sceneStorage);
  const deletionHandler = new DeletionHandler(sceneStorage);
  const cameraHandler = new CameraEditingHandler(sceneStorage);
  const objectAdditionHandler = new ObjectAdditionHandler(sceneStorage);
  const lightEditingHandler = new LightEditingHandler(sceneStorage);
  const environmentHandler = new EnvironmentHandler(sceneStorage);
  const textureImportHandler = new TextureImportHandler(
    sceneStorage,
    textureLocal,
    textureFigma
  );
  const textureExportHandler = new TextureExportHandler(
    sceneStorage,
    textureLocal,
    textureFigma
  );
  const toggleVisibilityHandler = new ToggleVisibilityHandler(sceneStorage);
  const toggleLockHandler = new ToggleLockHandler(sceneStorage);

  // --- Commands ---
  const executor = new ActionExecutor(sceneStorage);
  const gc = new DeletionGarbageCollector(sceneStorage);
  const bus = new CommandBus(sceneStorage, history, executor, gc);

  executor.handlers.set(CommandType.TransformObject, transformHandler);
  executor.handlers.set(CommandType.EditMaterial, materialEditingHandler);
  executor.handlers.set(CommandType.DeleteObject, deletionHandler);
  executor.handlers.set(CommandType.AddObject, objectAdditionHandler);
  executor.handlers.set(CommandType.EditLight, lightEditingHandler);
  executor.handlers.set(CommandType.EditCamera, cameraHandler);
  executor.handlers.set(CommandType.SetBackground, environmentHandler);
  executor.handlers.set(CommandType.ToggleShadows, environmentHandler);
  executor.handlers.set(CommandType.ImportTexture, textureImportHandler);
  executor.handlers.set(CommandType.ToggleVisibility, toggleVisibilityHandler);
  executor.handlers.set(CommandType.ToggleLock, toggleLockHandler);

  // SelectObject вызывается напрямую через selectionHandler, минуя bus
  // EditMaterial, ToggleLock, RenameScene — TBD

  // --- Сборка handlers-объекта для UI ---
  const makeProxy = <P extends object>(type: CommandType): HandlerProxy<P> => ({
    execute: (payload: P) => {
      bus.execute(type, payload);
    },
  });

  const handlers: AppHandlers = {
    selection: selectionHandler,
    camera: makeProxy(CommandType.EditCamera),

    environment: environmentHandler,

    transform: makeProxy(CommandType.TransformObject),
    materialEditing: makeProxy(CommandType.EditMaterial),
    deletion: makeProxy(CommandType.DeleteObject),
    visibility: makeProxy(CommandType.ToggleVisibility),
    lock: makeProxy(CommandType.ToggleLock),
    objectAddition: makeProxy(CommandType.AddObject),
    lightEditing: makeProxy(CommandType.EditLight),
    background: makeProxy(CommandType.SetBackground),
    shadows: makeProxy(CommandType.ToggleShadows),
    sceneRename: makeProxy(CommandType.RenameScene),
    textureImport: makeProxy(CommandType.ImportTexture),
    textureExport: (payload) => textureExportHandler.execute(payload),
  };

  return {
    handlers,
    undo: () => bus.undo(),
    redo: () => bus.redo(),
    listSceneEntities: () =>
      buildSceneEntityList(sceneStorage.getSceneOrNull()),
    transfer,
    renderService,
    notifications,
    help,
    tooltips,
    i18n,
  };
}
