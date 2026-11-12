import { useNotifications, useTransfer } from "@/app/ApplicationKernelContext";
import { BaseModal } from "../BaseModal";
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useSessionStore } from "@/store/sessionStore";
import {
  type DeviceExportFormat,
  type ExportOptions,
  type DeviceExportResults,
  type FigmaOptions,
  type FileOptions,
  type FigmaExportResults,
  ExportTypes,
} from "@/types/io";
import { MainButton, MidiButton } from "@atoms/buttons/Button";
import { TextBlock } from "@atoms/outputs/TextBlock";
import { ToggleSettings } from "@molecules/inputs/ToggleSettings";
import styles from "./ExportModal.module.scss";
import { NumberFieldPairSettings } from "@/ui/components/molecules/inputs/NumberFieldSettings";
import type { RenderOptions } from "@/types/render";
import { produce } from "immer";
import clsx from "clsx";
import { useSceneStore } from "@/store/sceneStore";
import { Loader } from "@/ui/components/atoms/indicators/Loader";
import { AppError, ErrorCode } from "@/services/alert/errors";
import { randomUUID } from "@/lib/randomId";

import infoIcon from "@images/icons/descriptive/info.svg?react";
import type { InputPairValues } from "@/ui/components/atoms/inputs/TextInputs";
import type { SceneCamera } from "@/types/scene";

type ModalType = "figma" | "device";
type ModalState = "settings" | "loading" | "success" | "finish";
type ModalData = { type: ModalType; state: ModalState };
type Frames = { frameID: string; name: string }[];

function toRatio(
  [width, height]: InputPairValues,
  aspect: SceneCamera["aspect"]
): [number, number] {
  const other = width
    ? (width * aspect[1]) / aspect[0]
    : (height! * aspect[0]) / aspect[1];

  return [width ?? other, height ?? other];
}

function FileLoader({
  action,
  filename,
  text,
  frozen,
}: {
  action: () => Promise<DeviceExportResults | undefined>;
  filename: string;
  text: string;
  frozen: boolean;
}) {
  type ExportResultURLs = Partial<Record<keyof DeviceExportResults, string>>;

  const [links, setLinks] = useState<ExportResultURLs | null>(null);
  const [modalData, setModalData] = useContext(ExportModalContext)!;

  const notifications = useNotifications();
  const id = useRef(randomUUID());

  const onCleanup = useEffectEvent(() => {
    if (links) {
      Object.values(links).forEach((link) => link && URL.revokeObjectURL(link));
    }
  });

  async function loadFile() {
    try {
      const resultBlobs = await action();
      const newLinks: ExportResultURLs = {
        png: "",
        gltf: "",
        zip: "",
      };

      (
        Object.entries(resultBlobs!) as [
          keyof DeviceExportResults,
          Blob | null,
        ][]
      ).forEach(([k, v]) => {
        if (!v) return;
        const a = document.createElement("a");
        const url = URL.createObjectURL(v);
        a.download = `${filename}.${k}`;
        a.href = url;
        a.click();
        newLinks[k] = url;
      });

      setLinks(newLinks);
      setModalData((prev) => ({ ...prev, state: "success" }));
    } catch (error) {
      if (error instanceof AppError) {
        notifications.push(error, id.current);
      } else {
        notifications.push(
          new AppError(
            ErrorCode.UnknownError,
            "Unknown error while exporting files"
          ),
          id.current
        );
        console.error(error);
      }
      setModalData((prev) => ({ ...prev, state: "finish" }));
    }
  }

  useEffect(() => {
    return () => {
      onCleanup();
    };
  }, []);
  return (
    <>
      <MainButton
        text={text}
        onClick={() => {
          if (!frozen) {
            setModalData((prev) => ({ ...prev, state: "loading" }));
            loadFile();
          }
        }}
        frozen={frozen}
      />
    </>
  );
}

function FigmaLoader({
  action,
  text,
  frozen,
}: {
  action: () => Promise<FigmaExportResults | undefined>;
  text: string;
  frozen: boolean;
}) {
  const [modalData, setModalData] = useContext(ExportModalContext)!;
  const notifications = useNotifications();

  const id = useRef(randomUUID());

  async function loadFrame() {
    try {
      const result = await action();
      if (result?.success)
        setModalData((prev) => ({ ...prev, state: "success" }));
      else
        throw new AppError(
          ErrorCode.UnknownFigmaExportError,
          "Unknown error while exporting files"
        );
    } catch (error) {
      if (error instanceof AppError) {
        notifications.push(error, id.current);
      } else {
        notifications.push(
          new AppError(
            ErrorCode.UnknownError,
            "Unknown error while exporting files"
          ),
          id.current
        );
        console.error(error);
      }
    } finally {
      setModalData((prev) => ({ ...prev, state: "finish" }));
    }
  }

  return (
    <>
      <MainButton
        text={text}
        onClick={() => {
          if (!frozen) {
            setModalData((prev) => ({ ...prev, state: "loading" }));
            loadFrame();
          }
        }}
        frozen={frozen}
      />
    </>
  );
}

function ImageSettings({
  renderOptions,
  aspect,
  updateOption,
}: {
  renderOptions: RenderOptions;
  aspect: SceneCamera["aspect"];
  updateOption: <K extends keyof ExportOptions>(
    k: K,
    v: ExportOptions[K]
  ) => void;
}) {
  return (
    <>
      <h3 className="h2">Изображение</h3>
      <ToggleSettings
        title="Экспортировать рендер"
        value={renderOptions.render!}
        frozen={false}
        onChange={() =>
          updateOption("renderOptions", {
            ...renderOptions,
            render: !renderOptions.render,
          })
        }
      />
      <div
        className={clsx(styles.gridInner, {
          [styles.gridInnerFrozen]: !renderOptions.render,
        })}
      >
        <NumberFieldPairSettings
          title="Разрешение"
          label="Соотношение сторон рендера"
          field={{
            label1: "w",
            label2: "h",
            value1: renderOptions.width + "",
            value2: renderOptions.height + "",
            onApply: (...values: InputPairValues) => {
              const [newWidth, newHeight] = toRatio(values, aspect);
              updateOption("renderOptions", {
                ...renderOptions,
                width: newWidth,
                height: newHeight,
              });
            },
            isActive: false,
          }}
        />
        <ToggleSettings
          title="Прозрачность"
          label="Сохранить прозрачный фон изображения вместо белого"
          value={renderOptions.transparentBackground}
          frozen={!renderOptions.render}
          onChange={() =>
            updateOption("renderOptions", {
              ...renderOptions,
              transparentBackground: !renderOptions.transparentBackground,
            })
          }
        />
      </div>
    </>
  );
}

function ExportModalLayout({
  show,
  info,
  left,
  right,
  button,
}: {
  show: boolean;
  info: ReactNode;
  left: ReactNode;
  right: ReactNode;
  button: ReactNode;
}) {
  return (
    <div className={clsx(styles.grid, { [styles.hidden]: !show })}>
      <TextBlock className={styles.gridInfo} Icon={infoIcon}>
        {info}
      </TextBlock>
      <TextBlock max className={styles.gridSetL}>
        {left}
      </TextBlock>
      <TextBlock max className={styles.gridSetR}>
        {right}
      </TextBlock>
      <div className={styles.gridButton}>{button}</div>
    </div>
  );
}

function ExportDevice({
  options,
  updateOption,
  action,
  aspect,
  showContent,
}: {
  options: ExportOptions;
  updateOption: <K extends keyof ExportOptions>(
    k: K,
    v: ExportOptions[K]
  ) => void;
  action: () => Promise<DeviceExportResults | undefined>;
  aspect: SceneCamera["aspect"];
  showContent: boolean;
}) {
  const info = (
    <p>
      Сохраняйте настроенную сцену на устройство в виде изображения в формате
      .PNG и/или файла сцены формата .GLTF (включает геометрию и материалы)
    </p>
  );

  const left = (
    <ImageSettings
      renderOptions={options.renderOptions}
      aspect={aspect}
      updateOption={updateOption}
    />
  );

  const right = (
    <>
      <h3 className="h2">Сцена</h3>
      <ToggleSettings
        title="Экспортировать файл сцены"
        value={options.fileOptions.file!}
        onChange={() =>
          updateOption("fileOptions", {
            ...options.fileOptions,
            file: !options.fileOptions.file,
          })
        }
        frozen={false}
      />
      <div
        className={clsx(styles.gridInner, {
          [styles.gridInnerFrozen]: !options.fileOptions.file,
        })}
      >
        <ToggleSettings
          title="Только видимые"
          label="Сохранить только видимые в сцене объекты"
          value={options.fileOptions.onlyVisible}
          frozen={!options.fileOptions.file}
          onChange={() =>
            updateOption("fileOptions", {
              ...options.fileOptions,
              onlyVisible: !options.fileOptions.onlyVisible,
            })
          }
        />
      </div>
      <ToggleSettings
        title="Текстуры архивом"
        label="Дополнительно сохранить текстуры как zip-архив"
        value={options.fileOptions.appendTextures}
        frozen={false}
        onChange={() =>
          updateOption("fileOptions", {
            ...options.fileOptions,
            appendTextures: !options.fileOptions.appendTextures,
          })
        }
      />
    </>
  );

  const button = (
    <FileLoader
      action={() => action()}
      filename="scene"
      text="Экспортировать"
      frozen={
        !(
          options.renderOptions.render ||
          options.fileOptions.file ||
          options.fileOptions.appendTextures
        )
      }
    />
  );

  return (
    <ExportModalLayout
      show={showContent}
      info={info}
      left={left}
      right={right}
      button={button}
    />
  );
}

function ExportFigma({
  options,
  updateOption,
  action,
  aspect,
  showContent,
  framesToReplace,
}: {
  options: ExportOptions;
  updateOption: <K extends keyof ExportOptions>(
    k: K,
    v: ExportOptions[K]
  ) => void;
  action: () => Promise<FigmaExportResults | undefined>;
  aspect: SceneCamera["aspect"];
  showContent: boolean;
  framesToReplace: Frames;
}) {
  const info = (
    <p>
      Продолжайте работу с ранее загруженной в Figma 3D-сценой без повторной
      настройки материалов и камеры. Вы можете импортировать сцену с любого
      аккаунта и устройства. Для работы с данной функцией: Экспортируйте сцену в
      Figma как связанный рендер Не удаляйте файлы текстур, экспортированные
      вместе с рендером
    </p>
  );

  const left = (
    <ImageSettings
      renderOptions={options.renderOptions}
      aspect={aspect}
      updateOption={updateOption}
    />
  );

  const right = (
    <>
      <h3 className="h2">Дополнительные возможности с Figma</h3>
      <ToggleSettings
        title="Связанный рендер"
        label="Сохранить сцену для возможности быстрого редактирования (для сцены до 5Мб)"
        value={options.figmaOptions.linkedRender}
        frozen={false}
        onChange={() =>
          updateOption("figmaOptions", {
            ...options.figmaOptions,
            linkedRender: !options.figmaOptions.linkedRender,
          })
        }
      />
      <div
        className={clsx(styles.gridInner, {
          [styles.gridInnerFrozen]: !options.figmaOptions.linkedRender,
        })}
      >
        <ToggleSettings
          title="Обновить фреймы с этой сценой"
          value={options.figmaOptions.updateFrames}
          frozen={false}
          onChange={() =>
            updateOption("figmaOptions", {
              ...options.figmaOptions,
              updateFrames: !options.figmaOptions.updateFrames,
            })
          }
        />
        <div>
          {framesToReplace.map((frame) => (
            <p>
              {frame.name} {frame.frameID}
            </p>
          ))}
        </div>
      </div>
    </>
  );

  const button = (
    <FigmaLoader
      action={action}
      text="Экспорт в Figma"
      frozen={
        !(options.renderOptions.render || options.figmaOptions.linkedRender)
      }
    />
  );

  return (
    <ExportModalLayout
      show={showContent}
      info={info}
      left={left}
      right={right}
      button={button}
    />
  );
}

const ExportModalContext = createContext<
  [ModalData, Dispatch<SetStateAction<ModalData>>] | null
>(null);

function ModalStateWrapper({ children }: { children: React.ReactNode }) {
  const [modalData, setModalData] = useContext(ExportModalContext)!;
  return (
    <>
      <BaseModal
        size={
          modalData.state == "loading" || modalData.state == "success"
            ? "mini"
            : "default"
        }
        title="Export Scene"
        buttonTitle={modalData.type == "device" ? "figma" : "device"}
        buttonAction={() =>
          setModalData({
            ...modalData,
            type: modalData.type == "device" ? "figma" : "device",
          })
        }
      >
        {children}
      </BaseModal>
    </>
  );
}

export function ExportModal() {
  const type = useSessionStore((s) => s.modalType);
  const setType = useSessionStore((s) => s.setModalType);
  const transfer = useTransfer();

  const activeCameraID = useSessionStore((s) => s.activeCameraID);
  const cameras = useSceneStore((s) => s.scene?.cameras);

  const [modalData, setModalData] = useState<ModalData>({
    state: "settings",
    type: "device",
  });

  useEffect(() => {
    if (modalData.state == "finish") {
      setType(null);
      setModalData({ state: "settings", type: "device" });
    }
  }, [type, modalData.state]);

  if (!cameras) return;

  const activeCamera = cameras[activeCameraID];
  const aspect = activeCamera.aspect;

  const initialRenderSize: InputPairValues =
    aspect[0] > aspect[1] ? [undefined, 1000] : [1000, undefined];

  const [exportOptions, setExportOptions] = useState<ExportOptions>(() => {
    const renderOptions: RenderOptions = {
      transparentBackground: false,
      width: toRatio(initialRenderSize, aspect)[0],
      height: toRatio(initialRenderSize, aspect)[1],
      render: true,
    };

    const fileOptions: FileOptions = {
      appendTextures: false,
      onlyVisible: true,
      file: false,
    };

    const figmaOptions: FigmaOptions = {
      linkedRender: false,
      updateFrames: false,
      framesToUpdate: [],
    };

    return {
      renderOptions,
      fileOptions,
      figmaOptions,
    };
  });

  const updateOption = <K extends keyof ExportOptions>(
    k: K,
    v: ExportOptions[K]
  ) => {
    setExportOptions((state: ExportOptions) =>
      produce(state, (d: ExportOptions) => {
        d[k] = v;
      })
    );
  };

  const tempFrames: Frames = [{ name: "test", frameID: "1323" }];

  return (
    <>
      {type == "export" && (
        <ExportModalContext value={[modalData, setModalData]}>
          <ModalStateWrapper>
            {modalData.type == "device" && (
              <ExportDevice
                options={exportOptions}
                updateOption={updateOption}
                action={() =>
                  transfer.exportScene({
                    format: exportOptions,
                    to: ExportTypes.device,
                  })
                }
                aspect={activeCamera.aspect}
                showContent={modalData.state == "settings"}
              />
            )}
            {modalData.type == "figma" && (
              <ExportFigma
                options={exportOptions}
                updateOption={updateOption}
                action={() =>
                  transfer.exportScene({
                    format: exportOptions,
                    to: ExportTypes.figma,
                  })
                }
                aspect={activeCamera.aspect}
                showContent={modalData.state == "settings"}
                framesToReplace={tempFrames}
              />
            )}
            {modalData.state == "loading" && (
              <div
                style={{
                  display: "flex",
                  flexGrow: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader />
              </div>
            )}
            {modalData.state == "success" && (
              <div className={styles.success}>
                <div>
                  <h2 className={clsx("h2", styles.successHeader)}>Успех!</h2>
                  <p className="t2">
                    Экспорт завершён.
                    <br />
                    Можете продолжить работу с проектом, начать новый или
                    закрыть плагин
                  </p>
                </div>
                <MidiButton
                  onClick={() => {
                    setModalData((prev) => ({ ...prev, state: "finish" }));
                    setType(null);
                  }}
                  isActive={true}
                  text="Закрыть окно"
                />
              </div>
            )}
          </ModalStateWrapper>
        </ExportModalContext>
      )}
    </>
  );
}
