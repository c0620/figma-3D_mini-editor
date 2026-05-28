import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTransfer } from "@/app/ApplicationKernelContext";
import {
  computeSceneStatsSummary,
  formatTextureCountRu,
  type SceneStatsSummary,
} from "@/lib/sceneMeta";
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
import buttonStyles from "../atoms/Button.module.css";
import { InputVal, Toggle } from "../atoms/Input";
import infoIcon from "@/assets/images/icons/descriptive/info.svg";
import polyIcon from "@/assets/images/icons/descriptive/poly.svg";
import sceneSizeIcon from "@/assets/images/icons/descriptive/sceneSize.svg";
import textureIcon from "@/assets/images/icons/descriptive/texture.svg";
import styles from "./ExportModal.module.css";

type Export = "figma" | "local";

function SettingRow({
  title,
  hint,
  dimmed,
  children,
}: {
  title: string;
  hint?: string;
  dimmed?: boolean;
  children: ReactNode;
}) {
  const rowClass = [styles.settingRow, dimmed ? styles.isDimmed : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClass}>
      <div className={styles.settingCopy}>
        <p className={styles.settingTitle}>{title}</p>
        {hint ? <p className={styles.settingHint}>{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function ExportModal({
  onClose,
  onExportDismiss,
  onExportComplete,
}: {
  onClose?: () => void;
  onExportDismiss?: () => void;
  onExportComplete?: (ok: boolean) => void;
}) {
  const transfer = useTransfer();
  const scene = useSceneStore((s) => s.scene);
  const projectName = useSessionStore((s) => s.projectName);
  const aspect = scene?.camera.aspect ?? 16 / 9;

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const [sceneStats, setSceneStats] = useState<SceneStatsSummary | null>(null);
  const [sceneStatsLoading, setSceneStatsLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  useEffect(() => {
    if (!scene) {
      setSceneStats(null);
      setSceneStatsLoading(false);
      return;
    }

    let cancelled = false;
    setSceneStatsLoading(true);

    void computeSceneStatsSummary(scene)
      .then((stats) => {
        if (!cancelled) setSceneStats(stats);
      })
      .catch(() => {
        if (!cancelled) setSceneStats(null);
      })
      .finally(() => {
        if (!cancelled) setSceneStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scene]);

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

  const canExportLocal = !!scene && (exportImage || exportScene);
  const canExportFigma = !!scene;
  const canExport = exportType === "local" ? canExportLocal : canExportFigma;

  const handleExport = async () => {
    if (!canExport) return;

    onExportDismiss?.();

    const ok =
      exportType === "local"
        ? await transfer.exportToDevice({
            exportImage,
            exportScene,
            transparentBackground,
            includeTextures,
            includeCamera,
            width,
            height,
          })
        : await transfer.exportToFigma({
            width,
            height,
            transparentBackground,
            linkedRender,
          });

    onExportComplete?.(ok);
  };

  let title: string;
  let navSwitchType: Export;
  let description: ReactNode;
  let leftParams: ReactNode;
  let rightParams: ReactNode;

  const resolutionActive = exportType === "figma" || exportImage;

  const changeResolution = (
    <div className={styles.resolutionBlock}>
      <div className={styles.resolutionRow}>
        <div className={styles.settingCopy}>
          <p className={styles.settingTitle}>Разрешение рендера</p>
          <p className={styles.settingHint}>
            Соотношение сторон изменяется в настройках камеры
          </p>
        </div>
        <div
          className={`${styles.resolutionInputs} ${resolutionActive ? "" : styles.isDimmed}`}
        >
          <div className={styles.axisField}>
            <span className={styles.axisLabel}>w</span>
            <InputVal
              field={{
                onChange: handleWidthChange,
                value: width,
                isActive: resolutionActive,
                label: "Ширина",
              }}
            />
          </div>
          <div className={styles.axisField}>
            <span className={styles.axisLabel}>h</span>
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
          аккаунта и устройства.
        </p>
      );

      leftParams = (
        <div className={styles.column}>
          <p className={styles.columnTitle}>Параметры экспорта</p>
          <div className={styles.columnBody}>
            {changeResolution}
            <SettingRow
              title="Прозрачность"
              hint="Сохранить прозрачный фон изображения вместо цветного"
            >
              <Toggle
                checked={transparentBackground}
                onChange={setTransparentBackground}
              />
            </SettingRow>
            <SettingRow
              title="Связанный рендер"
              hint="Сохранить сцену для возможности быстрого редактирования"
            >
              <Toggle checked={linkedRender} onChange={setLinkedRender} />
            </SettingRow>
            <SettingRow
              title="Сохранить текстуры"
              hint="Будут создана секция, откуда восстановятся текстуры при повторной работе"
              dimmed
            >
              <Toggle
                checked={saveTextures}
                onChange={setSaveTextures}
                disabled
              />
            </SettingRow>
          </div>
        </div>
      );

      rightParams = (
        <div className={styles.column}>
          <p className={styles.columnTitle}>Фреймы с этой сценой</p>
          <div className={styles.columnBody}>
            {linkedFrames.length > 0 ? (
              <ul className={styles.framesList}>
                {linkedFrames.map((frame) => (
                  <li key={frame.id}>{frame.name}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.framesEmpty}>
                Похоже, с этой сценой в Figma не экспортирован ни один фрейм.{" "}
                <strong>Назовите проект</strong> и экспортируйте, чтобы иметь
                возможность обновить его при повторной работе со сценой. При
                изменении названия проекта обновить фрейм будет невозможно!
              </p>
            )}
          </div>
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
        <div className={styles.column}>
          <p className={styles.columnTitle}>Изображение</p>
          <div className={styles.columnBody}>
            <SettingRow title="Экспортировать изображение">
              <Toggle checked={exportImage} onChange={setExportImage} />
            </SettingRow>
            <div className={exportImage ? "" : styles.isDimmed}>
              {changeResolution}
              <SettingRow
                title="Прозрачность"
                hint="Сохранить прозрачный фон изображения вместо цветного"
              >
                <Toggle
                  checked={transparentBackground}
                  onChange={setTransparentBackground}
                  disabled={!exportImage}
                />
              </SettingRow>
            </div>
          </div>
        </div>
      );

      rightParams = (
        <div
          className={`${styles.column} ${exportScene ? "" : styles.isDimmed}`}
        >
          <p className={styles.columnTitle}>Сцена</p>
          <div className={styles.columnBody}>
            <SettingRow title="Экспортировать файл сцены">
              <Toggle checked={exportScene} onChange={setExportScene} />
            </SettingRow>
            <SettingRow
              title="Включить текстуры"
              hint="Сохранить текстуры в виде отдельных файлов"
            >
              <Toggle
                checked={includeTextures}
                onChange={setIncludeTextures}
                disabled={!exportScene}
              />
            </SettingRow>
            <SettingRow
              title="Сохранить камеру"
              hint="Включить камеру в состав экспортируемой сцены"
            >
              <Toggle
                checked={includeCamera}
                onChange={setIncludeCamera}
                disabled={!exportScene}
              />
            </SettingRow>
          </div>
        </div>
      );

      break;
  }

  const polygonLabel = !scene
    ? "—"
    : sceneStatsLoading && !sceneStats
      ? "…"
      : sceneStats
        ? sceneStats.polygonCount.toLocaleString("ru-RU")
        : "—";

  const dimensionsLabel = !scene
    ? "—"
    : sceneStatsLoading && !sceneStats
      ? "…"
      : (sceneStats?.dimensions ?? "—");

  const texturesLabel = !scene
    ? "—"
    : sceneStatsLoading && !sceneStats
      ? "…"
      : sceneStats
        ? formatTextureCountRu(sceneStats.textureCount)
        : "—";

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={styles.modal}
        data-export-type={exportType}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <NavModal
          title={title}
          switchMode={() => setExportType(navSwitchType)}
          onClose={handleClose}
          switchText={
            navSwitchType == "figma"
              ? "Экспорт в Figma"
              : "Экспорт на устройство"
          }
        />
        <div className={styles.modalScroll}>
          <div className={styles.infoBanner}>
            <img src={infoIcon} alt="" />
            {description}
          </div>
          <section className={styles.sceneBar}>
            <p className={styles.sceneBarTitle}>
              Параметры экспортируемой сцены
            </p>
            <div className={styles.sceneStats}>
              <span className={styles.sceneStatItem}>
                <img className={styles.sceneStatIcon} src={polyIcon} alt="" />
                {polygonLabel} полигонов
              </span>
              <span className={styles.sceneStatItem}>
                <img
                  className={styles.sceneStatIcon}
                  src={sceneSizeIcon}
                  alt=""
                />
                {dimensionsLabel}
              </span>
              <span className={styles.sceneStatItem}>
                <img
                  className={styles.sceneStatIcon}
                  src={textureIcon}
                  alt=""
                />
                {texturesLabel}
              </span>
            </div>
          </section>
          <div className={styles.columns}>
            {leftParams}
            {rightParams}
          </div>
        </div>
        <div className={styles.footer}>
          <ActionButton
            text="Экспортировать"
            onClick={handleExport}
            disabled={!canExport}
            className={buttonStyles.actionButtonModal}
          />
        </div>
      </div>
    </div>
  );
}
