import type { TranslationBundle } from "./en";

const ru: TranslationBundle = {
  // --- Panel: scene graph ---
  "panel.scene.title": "Сцена",
  "panel.scene.content": "Содержимое сцены",
  "panel.params.title": "Параметры",
  "panel.params.meshMaterials": "Материалы меша",
  "panel.params.materialParams": "Параметры {name}",
  "panel.params.materialTextures": "Текстуры {name}",
  "material.roughness": "Шероховатость",
  "material.metalness": "Блеск",
  "material.emissiveIntensity": "Сила свечения",
  "material.baseColor": "Основной цвет",
  "material.baseColor.rgb": "RGB",
  "material.figmaVariable.placeholder": "Выберите переменную Figma",
  "material.figmaVariable.none": "Без переменной",
  "material.figmaVariable.empty": "В файле нет цветовых переменных",
  "material.figmaVariable.unavailable": "Доступно только в плагине Figma",

  "texture.slot.BaseColor": "Основной цвет",
  "texture.slot.Normal": "Карта нормалей",
  "texture.slot.Roughness": "Шероховатость",
  "texture.slot.Metalness": "Металличность",
  "texture.slot.Emissive": "Свечение",
  "texture.action.saveDevice": "Сохранить на устройство",
  "texture.action.loadDevice": "Загрузить с устройства",
  "texture.action.saveFigma": "Сохранить во фрейм Figma",
  "texture.action.loadFigma": "Загрузить из фрейма Figma",
  "texture.action.delete": "Удалить текстуру",
  "texture.notify.saveFailed": "Не удалось скачать текстуру",
  "texture.notify.noLinkedFrame":
    "Выберите на холсте фрейм со связанным рендером",
  "texture.notify.figmaExportPending": "Экспорт во фрейм Figma пока недоступен",
  "texture.notify.figmaImportPending": "Импорт из фрейма Figma пока недоступен",
  "texture.notify.figmaImportFailed": "Не удалось загрузить текстуру из Figma",
  "panel.scene.addObject": "Добавить объект",
  "panel.scene.addLight": "Добавить свет",
  "panel.scene.editing": "Редактирование объекта",
  "panel.scene.locked": "Объект заблокирован — параметры недоступны",
  "input.projectName.placeholder": "Название проекта",

  // --- Transform groups ---
  "transform.position": "Позиция",
  "transform.rotation": "Поворот",
  "transform.scale": "Масштаб",

  // --- Scene entity labels ---
  "entity.mesh.default": "Меш",
  "entity.light.directional": "Направленный свет",
  "entity.light.ambient": "Окружающий свет",
  "entity.light.spot": "Прожектор",
  "entity.light.hdri": "HDRI",
  "entity.camera.perspective": "Камера (перспектива)",
  "entity.camera.orthographic": "Камера (ортография)",

  // --- Camera params ---
  "camera.type.title": "Тип камеры",
  "camera.type.perspective": "Перспективная камера",
  "camera.type.orthographic": "Ортогональная камера",
  "camera.params.title": "Параметры камеры",
  "camera.near": "Ближняя граница видимости",
  "camera.far": "Дальняя граница видимости",
  "camera.aspect": "Соотношение сторон рендера",
  "camera.renderArea": "Область рендера",
  "camera.aspectPreview.mode": "Режим предпросмотра",
  "camera.fov": "Угловое поле объектива",
  "camera.fov.preset.fov15": "Широкий (15 mm)",
  "camera.fov.preset.fov35": "Стандарт (35 mm)",
  "camera.fov.preset.fov50": "Нормальный (50 mm)",
  "camera.fov.preset.fov70": "Портрет (70 mm)",
  "camera.fov.preset.fov400": "Телефото (400 mm)",
  "camera.aspect.width": "Ш",
  "camera.aspect.height": "В",
  "camera.zoom": "Zoom",
  "camera.presets": "Пресеты камеры",
  "camera.preset.front": "Спереди",
  "camera.preset.back": "Сзади",
  "camera.preset.top": "Верх",
  "camera.preset.bottom": "Низ",
  "camera.preset.left": "Лево",
  "camera.preset.right": "Право",
  "camera.preset.saved": "Сохранённый",
  "camera.preset.saveCurrent": "Сохранить текущий ракурс",
  "camera.help.type.title": "Тип камеры",
  "camera.help.type.body":
    "Перспективная камера имитирует объектив с перспективой. Ортогональная — без искажения перспективы, удобна для чертежей и UI.",
  "camera.help.presets.title": "Пресеты камеры",
  "camera.help.presets.body":
    "Быстро переключают стандартные ракурсы. Сохранённый ракурс — ваша позиция камеры; кнопка внизу запоминает текущий вид.",

  "light.type.title": "Вид источника света",
  "light.type.ambient": "Рассеянный свет",
  "light.type.spot": "Направленный свет",
  "light.type.hdri": "Фоновый свет (HDRI)",
  "light.params.title": "Параметры {name}",
  "light.intensity": "Сила свечения",
  "light.distance": "Дальность затухания",
  "light.penumbra": "Сила рассеивания",
  "light.angle": "Угол рассеивания",
  "light.target": "Объект, на который направлен свет",
  "light.target.placeholder": "Выберите переменную Figma",
  "light.presets.title": "Пресеты освещения",
  "light.preset.soft": "Мягкое",
  "light.preset.hard": "Жёсткое",
  "light.preset.flat": "Стилизованное плоское",
  "light.hdriPreset.title": "HDR-пресеты",
  "light.hdriPreset": "HDR-пресет",
  "light.help.type.title": "Вид источника света",
  "light.help.type.body":
    "Рассеянный свет равномерно освещает сцену. Направленный — как прожектор. HDRI использует карту окружения для освещения по изображению.",
  "light.help.presets.title": "Пресеты освещения",
  "light.help.presets.body":
    "Быстро настраивают полутень и угол конуса для типовых сцен.",
  "light.help.hdri.title": "HDR-пресеты",
  "light.help.hdri.body":
    "Выбор карты окружения для отражений и фонового освещения.",
  "light.hdriPreset.studio": "Студия",
  "light.hdriPreset.sunset": "Закат",
  "light.hdriPreset.warehouse": "Склад",

  // --- Notifications ---
  "notify.scene.imported": "Сцена импортирована",
  "notify.scene.exported": "Сцена экспортирована",
  "notify.scene.exportFigma": "Сцена сохранена как связанный рендер",
  "notify.error.import": "Не удалось импортировать сцену",
  "notify.error.export": "Не удалось экспортировать сцену",
  "notify.error.generic": "Произошла ошибка",

  // --- Export success ---
  "export.success.title": "Успех!",
  "export.success.body":
    "Экспорт завершён. Можете продолжить работу с проектом,\nначать новый\nили закрыть плагин",
  "export.success.cta": "К проекту",

  // --- Screens ---
  "screen.start.title": "Редактор 3D-сцен",
  "screen.start.newScene": "Новая сцена",
  "screen.start.loadScene": "Загрузить сцену",
  "screen.load.title": "Выберите файл",
  "screen.load.supportedFormats": "Поддерживаемые форматы: GLB, FBX, OBJ",
  "screen.editor.title": "Редактор",

  // --- Asset library ---
  "library.title": "Библиотека ассетов",
  "library.stats": "{count} ассетов по {tags} тегам:",
  "library.filter.primitive": "Примитив",
  "library.filter.abstract": "Абстрактная фигура",
  "library.filter.mockup": "Мокап",
  "library.addToScene": "Добавить в сцену",
  "library.polygons": "Количество полигонов: {count}",
  "library.proceduralSize": "Размер файла: —",
  "library.empty": "В этой категории пока нет ассетов",
  "library.tag.primitive": "Примитив",
  "library.tag.abstract": "Абстрактная фигура",
  "library.tag.mockup": "Мокап",
  "library.asset.box.name": "Куб",
  "library.asset.sphere.name": "Сфера",
  "library.asset.cylinder.name": "Цилиндр",
  "library.asset.cone.name": "Конус",
  "library.asset.torus.name": "Тор",
  "library.asset.plane.name": "Плоскость",
  "library.asset.icosahedron.name": "Икосаэдр",
  "library.asset.torusKnot.name": "Тор-узел",

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
  "help.title": "Справка",
  "help.step.1": "Импортируйте 3D-модель (GLB / FBX / OBJ)",
  "help.step.2": "Выберите объект в дереве сцены или вьюпорте",
  "help.step.3": "Настройте трансформ, материал, освещение",
  "help.step.4": "Экспортируйте рендер в Figma или сохраните на устройство",

  "help.nav.general": "Общая работа с плагином",
  "help.nav.general.settings": "Настройка плагина",
  "help.nav.general.interface": "Интерфейс плагина",
  "help.nav.general.renderLinked": "Рендер и связанный рендер",
  "help.nav.export": "Экспорт результатов",
  "help.nav.export.simple": "Простой рендер",
  "help.nav.export.linked": "Связанный рендер",
  "help.nav.export.local": "Сохранение на устройство",
  "help.nav.tools": "Инструменты",
  "help.nav.tools.meshes": "Меши",
  "help.nav.tools.textures": "Текстуры",
  "help.nav.tools.lights": "Источники света",
  "help.nav.tools.camera": "Камера",
  "help.nav.shortcuts": "Горячие клавиши",

  "help.section.general.title": "Общая работа с плагином",
  "help.section.settings.title": "Настройка плагина",
  "help.section.settings.item1": "Смена языка: доступны английский и русский",
  "help.section.settings.item2": "Переключение светлой и тёмной темы",
  "help.section.settings.item3": "Увеличение размера шрифта",
  "help.section.settings.item4": "Переключить размер окна: 800×450, 1600×900",
  "help.section.interface.title": "Интерфейс плагина",
  "help.section.interface.body":
    "Рабочая область состоит из 3D-вьюпорта, боковых панелей и панелей инструментов. Дерево сцены показывает все объекты; панель параметров отображает свойства выбранного элемента.",
  "help.section.interface.intro":
    "Верхняя панель отвечает за всю сцену сразу. Здесь можно:",
  "help.section.interface.action1": "Очистить сцену",
  "help.section.interface.action2": "Изменить цвет фона",
  "help.section.interface.action3": "Включить или выключить тени",
  "help.section.interface.action4": "Экспортировать рендер",
  "help.section.renderLinked.title": "Рендер и связанный рендер",
  "help.section.renderLinked.body":
    "Простой рендер сохраняет изображение PNG в Figma или на устройство. Связанный рендер дополнительно записывает данные сцены в файл Figma, чтобы позже открыть и отредактировать сцену из того же фрейма.",
  "help.section.renderLinked.item1":
    "Задайте название проекта перед экспортом в Figma для связанного обновления",
  "help.section.renderLinked.item2":
    "Не удаляйте файлы текстур, экспортированные вместе со связанным рендером",

  "help.section.export.title": "Экспорт результатов",
  "help.section.exportSimple.title": "Простой рендер",
  "help.section.exportSimple.body":
    "Экспорт текущего вида вьюпорта в PNG. В диалоге экспорта задайте разрешение и прозрачность. Подходит для Figma и локального сохранения, когда нужно только изображение.",
  "help.section.exportLinked.title": "Связанный рендер",
  "help.section.exportLinked.body":
    "Сохраняет рендер во фрейм Figma вместе с метаданными сцены. Откройте плагин из этого фрейма, чтобы продолжить правку материалов, света и камеры без повторной настройки.",
  "help.section.exportLocal.title": "Сохранение на устройство",
  "help.section.exportLocal.body":
    "Скачайте снимок PNG и/или файл сцены GLB. GLB может включать геометрию, материалы, а при необходимости — отдельные текстуры и настройки камеры.",

  "help.section.tools.title": "Инструменты",
  "help.section.toolMeshes.title": "Меши",
  "help.section.toolMeshes.body":
    "Импортируйте модели GLB, FBX или OBJ с устройства или из библиотеки ассетов. Выберите меш в дереве сцены или вьюпорте, чтобы редактировать трансформ, видимость и материалы.",
  "help.section.toolMeshes.item1":
    "Перемещение, поворот и масштаб инструментами gizmo (G / R / S)",
  "help.section.toolMeshes.item2":
    "Настройка цвета, metalness и roughness материала в панели параметров",
  "help.section.toolTextures.title": "Текстуры",
  "help.section.toolTextures.body":
    "Назначайте растровые текстуры материалам мешей. Выбирайте файлы с диска или используйте текстуры из импортированных моделей.",
  "help.section.toolLights.title": "Источники света",
  "help.section.toolLights.body":
    "Добавляйте ambient-, spot- или HDRI-свет из панели сцены. Настраивайте интенсивность, цвет и направление в панели параметров при выбранном источнике.",
  "help.section.toolCamera.title": "Камера",
  "help.section.toolCamera.body":
    "Переключайте перспективу и ортографию. Используйте пресеты ракурса, FOV, соотношение сторон и zoom. Aspect влияет на разрешение экспорта.",

  "help.section.shortcuts.title": "Горячие клавиши",
  "help.section.shortcuts.intro":
    "Сочетания для трансформации и редактирования во вьюпорте:",

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
