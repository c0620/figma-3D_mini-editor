import type { TranslationBundle } from "./en";

const ru: TranslationBundle = {
  // --- Panel: scene graph ---
  "panel.scene.addObject": "Добавить объект",
  "panel.scene.addLight": "Добавить свет",
  "panel.scene.editing": "Редактирование",
  "panel.scene.locked": "Объект заблокирован — параметры недоступны",

  // --- Transform groups ---
  "transform.position": "Позиция",
  "transform.rotation": "Поворот",
  "transform.scale": "Масштаб",

  // --- Scene entity labels ---
  "entity.mesh.default": "Меш",
  "entity.light.directional": "Направленный свет",
  "entity.light.ambient": "Окружающий свет",
  "entity.light.hdri": "HDRI",
  "entity.camera.perspective": "Камера (перспектива)",
  "entity.camera.orthographic": "Камера (ортография)",

  // --- Camera params ---
  "camera.near": "Near",
  "camera.far": "Far",
  "camera.aspect": "Aspect",
  "camera.fov": "FOV",
  "camera.zoom": "Zoom",
  "camera.type.perspective": "Перспектива",
  "camera.type.orthographic": "Ортография",
  "camera.aspectPreview": "Предпросмотр aspect",
  "camera.aspectPreview.on": "Предпросмотр вкл",
  "camera.aspectPreview.off": "Предпросмотр выкл",

  // --- Notifications ---
  "notify.scene.imported": "Сцена импортирована",
  "notify.scene.exported": "Сцена экспортирована",
  "notify.scene.exportFigma": "Сцена сохранена как связанный рендер",
  "notify.error.import": "Не удалось импортировать сцену",
  "notify.error.export": "Не удалось экспортировать сцену",
  "notify.error.generic": "Произошла ошибка",

  // --- Screens ---
  "screen.start.title": "Редактор 3D-сцен",
  "screen.start.newScene": "Новая сцена",
  "screen.start.loadScene": "Загрузить сцену",
  "screen.load.title": "Выберите файл",
  "screen.load.supportedFormats": "Поддерживаемые форматы: GLB, FBX, OBJ",
  "screen.editor.title": "Редактор",

  // --- Tooltips ---
  "tooltip.move.name": "Перемещение",
  "tooltip.move.description": "Перемещение объекта по осям XYZ",
  "tooltip.move.shortcut": "G",
  "tooltip.rotate.name": "Поворот",
  "tooltip.rotate.description": "Поворот объекта вокруг осей",
  "tooltip.rotate.shortcut": "R",
  "tooltip.scale.name": "Масштаб",
  "tooltip.scale.description": "Масштабирование объекта равномерно или по осям",
  "tooltip.scale.shortcut": "S",
  "tooltip.delete.name": "Удалить",
  "tooltip.delete.description": "Удалить выбранный объект из сцены",
  "tooltip.delete.shortcut": "Del",

  // --- Help ---
  "help.step.1": "Импортируйте 3D-модель (GLB / FBX / OBJ)",
  "help.step.2": "Выберите объект в дереве сцены или вьюпорте",
  "help.step.3": "Настройте трансформ, материал, освещение",
  "help.step.4": "Экспортируйте рендер в Figma или сохраните на устройство",

  // --- Common ---
  "common.undo": "Отменить",
  "common.redo": "Повторить",
  "common.cancel": "Отмена",
  "common.apply": "Применить",
  "common.close": "Закрыть",
  "common.save": "Сохранить",
  "common.delete": "Удалить",
};

export default ru;
