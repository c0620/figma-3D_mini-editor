import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTransfer } from "@/app/ApplicationKernelContext";
import { useSceneStore } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";
import type { LinkedFrameSummary } from "@/figma/figmaMessages";
import {
  defaultExportResolution,
  heightFromWidth,
  widthFromHeight,
} from "@/render/renderDimensions";
import { NavModal } from "../atoms/Navigation";
import { ActionButton } from "../atoms/Button";
import { InputVal, Toggle } from "../atoms/Input";

type Export = "figma" | "local";

export function ExportModal({ onClose }: { onClose?: () => void }) {
  const transfer = useTransfer();
  const scene = useSceneStore((s) => s.scene);
  const projectName = useSessionStore((s) => s.projectName);
  const aspect = scene?.camera.aspect ?? 16 / 9;

  const [exportType, setExportType] = useState<Export>("local");
  const [exportImage, setExportImage] = useState(true);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [exportScene, setExportScene] = useState(true);
  const [includeTextures, setIncludeTextures] = useState(false);
  const [includeCamera, setIncludeCamera] = useState(true);
  const [linkedRender, setLinkedRender] = useState(true);
  const [saveTextures, setSaveTextures] = useState(false);
  const [linkedFrames, setLinkedFrames] = useState<LinkedFrameSummary[]>([]);

  const defaultResolution = defaultExportResolution(aspect);
  const [width, setWidth] = useState(defaultResolution.width);
  const [height, setHeight] = useState(defaultResolution.height);
  const leadingDimension = useRef<"width" | "height">("width");

  useEffect(() => {
    if (leadingDimension.current === "width") {
      setHeight(heightFromWidth(width, aspect));
    } else {
      setWidth(widthFromHeight(height, aspect));
    }
  }, [aspect]);

  useEffect(() => {
    if (exportType !== "figma" || !scene) {
      setLinkedFrames([]);
      return;
    }

    void transfer
      .findFigmaSceneRenders(scene.id, projectName)
      .then(setLinkedFrames)
      .catch(() => setLinkedFrames([]));
  }, [exportType, scene, projectName, transfer]);

  const handleWidthChange = (value: number) => {
    leadingDimension.current = "width";
    setWidth(value);
    setHeight(heightFromWidth(value, aspect));
  };

  const handleHeightChange = (value: number) => {
    leadingDimension.current = "height";
    setHeight(value);
    setWidth(widthFromHeight(value, aspect));
  };

  const [isExporting, setIsExporting] = useState(false);

  const canExportLocal =
    !!scene && (exportImage || exportScene) && !isExporting;
  const canExportFigma = !!scene && !isExporting;
  const canExport = exportType === "local" ? canExportLocal : canExportFigma;

  const handleExport = async () => {
    if (exportType === "local") {
      setIsExporting(true);
      try {
        await transfer.exportToDevice({
          exportImage,
          exportScene,
          transparentBackground,
          includeTextures,
          includeCamera,
          width,
          height,
        });
        onClose?.();
      } finally {
        setIsExporting(false);
      }
      return;
    }

    setIsExporting(true);
    try {
      await transfer.exportToFigma({
        width,
        height,
        transparentBackground,
        linkedRender,
      });
      if (scene) {
        const frames = await transfer.findFigmaSceneRenders(
          scene.id,
          projectName
        );
        setLinkedFrames(frames);
      }
      onClose?.();
    } finally {
      setIsExporting(false);
    }
  };

  let title: string;
  let navSwitchType: Export;
  let description: ReactNode;
  let leftParams: ReactNode;
  let rightParams: ReactNode;

  const resolutionActive = exportType === "figma" || exportImage;

  const changeResolution = (
    <div>
      <div>
        <p>Разрешение рендера</p>
        <p>Соотношение сторон изменяется в настройках камеры</p>
      </div>
      <div style={{ pointerEvents: resolutionActive ? "auto" : "none" }}>
        <InputVal
          field={{
            onChange: handleWidthChange,
            value: width,
            isActive: resolutionActive,
            label: "Ширина",
          }}
        />
        <InputVal
          field={{
            onChange: handleHeightChange,
            value: height,
            isActive: resolutionActive,
            label: "Высота",
          }}
        />
      </div>
    </div>
  );

  switch (exportType) {
    case "figma":
      title = "Экспорт в Figma";
      navSwitchType = "local";
      description = (
        <p>
          Продолжайте работу с ранее загруженной в Figma 3D-сценой без повторной
          настройки материалов и камеры. Вы можете импортировать сцену с любого
          аккаунта и устройства. Для работы с данной функцией: Экспортируйте
          сцену в Figma как связанный рендер Не удаляйте файлы текстур,
          экспортированные вместе с рендером
        </p>
      );

      leftParams = (
        <div>
          <p>Параметры экспорта</p>
          {changeResolution}
          <div>
            <p>Прозрачность</p>
            <p>Сохранить прозрачный фон изображения вместо цветного</p>
            <Toggle
              checked={transparentBackground}
              onChange={setTransparentBackground}
            />
          </div>
          <div>
            <div>
              <p>Связанный рендер</p>
              <p>Сохранить сцену для возможности быстрого редактирования</p>
            </div>
            <Toggle checked={linkedRender} onChange={setLinkedRender} />
          </div>
          <div style={{ opacity: 0.5 }}>
            <div>
              <p>Сохранить текстуры</p>
              <p>
                Будут создана секция, откуда восстановятся текстуры при
                повторной работе
              </p>
            </div>
            <Toggle
              checked={saveTextures}
              onChange={setSaveTextures}
              disabled
            />
          </div>
        </div>
      );

      rightParams = (
        <div>
          <p>Фреймы с этой сценой</p>
          {linkedFrames.length > 0 ? (
            <ul>
              {linkedFrames.map((frame) => (
                <li key={frame.id}>{frame.name}</li>
              ))}
            </ul>
          ) : (
            <p>
              Похоже, с этой сценой в Figma не экспортирован ни один фрейм.
              Назовите проект и экспортируйте, чтобы иметь возможность обновить
              его при повторной работе со сценой. При изменении названия проекта
              обновить фрейм будет невозможно!
            </p>
          )}
        </div>
      );
      break;
    case "local":
      title = "Экспорт на устройство";
      navSwitchType = "figma";
      description = (
        <p>
          Сохраняйте настроенную сцену на устройство в виде изображения в
          формате .PNG и/или файла сцены формата .GLB (включает геометрию и
          материалы)
        </p>
      );

      leftParams = (
        <div>
          <p>Изображение</p>
          <div>
            <p>Экспортировать изображение</p>
            <Toggle checked={exportImage} onChange={setExportImage} />
          </div>
          <div style={{ opacity: exportImage ? 1 : 0.5 }}>
            {changeResolution}
            <div>
              <p>Прозрачность</p>
              <p>Сохранить прозрачный фон изображения вместо цветного</p>
              <Toggle
                checked={transparentBackground}
                onChange={setTransparentBackground}
                disabled={!exportImage}
              />
            </div>
          </div>
        </div>
      );

      rightParams = (
        <div style={{ opacity: exportScene ? 1 : 0.5 }}>
          <p>Сцена</p>
          <div>
            <p>Экспортировать файл сцены</p>
            <Toggle checked={exportScene} onChange={setExportScene} />
          </div>
          <div>
            <p>Включить текстуры</p>
            <p>Сохранить текстуры в виде отдельных файлов</p>
            <Toggle
              checked={includeTextures}
              onChange={setIncludeTextures}
              disabled={!exportScene}
            />
          </div>
          <div>
            <p>Сохранить камеру</p>
            <p>Включить камеру в состав экспортируемой сцены</p>
            <Toggle
              checked={includeCamera}
              onChange={setIncludeCamera}
              disabled={!exportScene}
            />
          </div>
        </div>
      );

      break;
  }

  return (
    <div style={{ zIndex: 100, position: "absolute", backgroundColor: "grey" }}>
      <NavModal
        title={title}
        switchMode={() => setExportType(navSwitchType)}
        onClose={() => onClose?.()}
        switchText={
          navSwitchType == "figma" ? "Экспорт в Figma" : "Экспорт на устройство"
        }
      />
      <div>{description}</div>
      <div>
        <p>Параметры экспортируемой сцены</p>
      </div>
      <div>
        {leftParams}
        {rightParams}
      </div>
      <ActionButton
        text="Экспортировать"
        onClick={handleExport}
        disabled={!canExport}
      />
    </div>
  );
}
