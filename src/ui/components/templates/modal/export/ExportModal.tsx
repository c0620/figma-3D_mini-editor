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
  type SetStateAction,
} from "react";
import { useSessionStore } from "@/store/sessionStore";
import type {
  DeviceExportFormat,
  ExportOptions,
  ExportResults,
  FileOptions,
} from "@/types/io";
import { MainButton, MidiButton } from "../../../atoms/buttons/Button";
import { TextBlock } from "../../../atoms/outputs/TextBlock";
import { ToggleSettings } from "../../../molecules/inputs/ToggleSettings";
import styles from "./ExportModal.module.scss";
import { NumberFieldPairSettings } from "@/ui/components/molecules/inputs/NumberFieldSettings";
import type { RenderOptions } from "@/types/render";
import { produce } from "immer";
import clsx from "clsx";
import { useSceneStore } from "@/store/sceneStore";
import type { InputPairValues } from "@/ui/components/atoms/inputs/TextInputs";
import { Loader } from "@/ui/components/atoms/indicators/Loader";
import { AppError, ErrorCode } from "@/services/information/errors";
import { randomUUID } from "@/lib/randomId";

import infoIcon from "@/assets/images/icons/descriptive/info.svg?react";

type ModalType = "figma" | "device";
type ModalState = "settings" | "loading" | "success" | "finish";
type ModalData = { type: ModalType; state: ModalState };

function FileLoader({
  action,
  filename,
  text,
  frozen,
}: {
  action: () => Promise<ExportResults>;
  filename: string;
  text: string;
  frozen: boolean;
}) {
  type ExportResultURLs = Partial<Record<keyof ExportResults, string>>;

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
        Object.entries(resultBlobs!) as [keyof ExportResults, Blob | null][]
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

function ExportDevice({
  action,
  aspect,
  showContent,
}: {
  action: (param: ExportOptions) => Promise<ExportResults>;
  aspect: number[];
  showContent: boolean;
}) {
  const toRatio = ([width, height]: InputPairValues): [number, number] => {
    const other = width
      ? (width * aspect[1]) / aspect[0]
      : (height! * aspect[0]) / aspect[1];

    return [width ?? other, height ?? other];
  };

  const initialSize: InputPairValues =
    aspect[0] > aspect[1] ? [undefined, 1000] : [1000, undefined];

  const renderOptions: RenderOptions = {
    transparentBackground: false,
    width: toRatio(initialSize)[0],
    height: toRatio(initialSize)[1],
    render: true,
  };
  const fileOptions: FileOptions = {
    appendTextures: false,
    onlyVisible: true,
    file: false,
  };

  const [exportType, setExportType] = useState<ExportOptions>({
    renderOptions,
    fileOptions,
  });

  const update = <K extends keyof typeof exportType>(
    k: K,
    v: (typeof exportType)[K]
  ) => {
    setExportType((state: ExportOptions) =>
      produce(state, (d: ExportOptions) => {
        d[k] = v;
      })
    );
  };

  return (
    <>
      <div className={clsx(styles.grid, { [styles.hidden]: !showContent })}>
        <TextBlock className={styles.gridInfo} Icon={infoIcon}>
          <p>
            Сохраняйте настроенную сцену на устройство в виде изображения в
            формате .PNG и/или файла сцены формата .GLTF (включает геометрию и
            материалы)
          </p>
        </TextBlock>
        <TextBlock max className={styles.gridSetL}>
          <h3 className="h2">Изображение</h3>
          <ToggleSettings
            title="Экспортировать рендер"
            value={exportType.renderOptions.render!}
            frozen={false}
            onChange={() =>
              update("renderOptions", {
                ...exportType.renderOptions,
                render: !exportType.renderOptions.render,
              })
            }
          />
          <div
            className={clsx(styles.gridInner, {
              [styles.gridInnerFrozen]: !exportType.renderOptions.render,
            })}
          >
            <NumberFieldPairSettings
              title="Разрешение"
              label="Соотношение сторон рендера"
              value1={exportType.renderOptions.width}
              value2={exportType.renderOptions.height}
              onChange={(...values: InputPairValues) => {
                const [newWidth, newHeight] = toRatio(values);
                update("renderOptions", {
                  ...exportType.renderOptions,
                  width: newWidth,
                  height: newHeight,
                });
              }}
              label1="w"
              label2="h"
            />
            <ToggleSettings
              title="Прозрачность"
              label="Сохранить прозрачный фон изображения вместо белого"
              value={exportType.renderOptions.transparentBackground}
              frozen={!exportType.renderOptions.render}
              onChange={() =>
                update("renderOptions", {
                  ...exportType.renderOptions,
                  transparentBackground:
                    !exportType.renderOptions.transparentBackground,
                })
              }
            />
          </div>
        </TextBlock>
        <TextBlock max className={styles.gridSetR}>
          <h3 className="h2">Сцена</h3>
          <ToggleSettings
            title="Экспортировать файл сцены"
            value={exportType.fileOptions.file!}
            onChange={() =>
              update("fileOptions", {
                ...exportType.fileOptions,
                file: !exportType.fileOptions.file,
              })
            }
            frozen={false}
          />
          <div
            className={clsx(styles.gridInner, {
              [styles.gridInnerFrozen]: !exportType.fileOptions.file,
            })}
          >
            <ToggleSettings
              title="Только видимые"
              label="Сохранить только видимые в сцене объекты"
              value={exportType.fileOptions.onlyVisible}
              frozen={!exportType.fileOptions.file}
              onChange={() =>
                update("fileOptions", {
                  ...exportType.fileOptions,
                  onlyVisible: !exportType.fileOptions.onlyVisible,
                })
              }
            />
          </div>
          <ToggleSettings
            title="Текстуры архивом"
            label="Дополнительно сохранить текстуры как zip-архив"
            value={exportType.fileOptions.appendTextures}
            frozen={false}
            onChange={() =>
              update("fileOptions", {
                ...exportType.fileOptions,
                appendTextures: !exportType.fileOptions.appendTextures,
              })
            }
          />
        </TextBlock>
        <div className={styles.gridButton}>
          <FileLoader
            action={() => action(exportType)}
            filename="scene"
            text="Экспортировать"
            frozen={
              !(
                exportType.renderOptions.render ||
                exportType.fileOptions.file ||
                exportType.fileOptions.appendTextures
              )
            }
          />
        </div>
      </div>
    </>
  );
}

function ExportFigmaStub() {
  return <p>Stub</p>;
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
        // buttonTitle={modalData.type == "device" ? "figma" : "device"}
        // buttonAction={() =>
        //   setModalData({
        //     ...modalData,
        //     type: modalData.type == "device" ? "figma" : "device",
        //   })
        // }
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
  return (
    <>
      {type == "export" && (
        <ExportModalContext value={[modalData, setModalData]}>
          <ModalStateWrapper>
            {modalData.type == "device" && (
              <ExportDevice
                action={(param) => transfer.exportSceneToDevice(param)}
                aspect={activeCamera.aspect}
                showContent={modalData.state == "settings"}
              />
            )}
            {modalData.type == "figma" && <ExportFigmaStub />}
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
