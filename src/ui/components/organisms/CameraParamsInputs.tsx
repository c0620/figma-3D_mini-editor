import { CameraType, type SceneCamera } from "@/types/scene";
import { NumberFieldInput } from "../molecules/inputs/NumberFieldInput";
import styles from "./CameraParamsInputs.module.scss";
import { ToggleState } from "../molecules/inputs/ToggleState";

import { useContext } from "react";
import { RatioInput } from "../molecules/inputs/RatioInput";
import { SelectLens } from "../molecules/inputs/SelectLens";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";
import { useHandlers } from "@/app/ApplicationKernelContext";
import { useSessionStore } from "@/store/sessionStore";
import clsx from "clsx";

export function CameraParamsInputs({
  activeCamera,
}: {
  activeCamera: SceneCamera;
}) {
  const mode = useContext(PanelSceneModeContext);
  const { camera } = useHandlers();
  const isCameraPreview = useSessionStore((s) => s.isCameraPreview);

  const toggleCameraPreview = useSessionStore((s) => s.toggleCameraPreview);

  return (
    <div className={styles.cameraParams}>
      {mode == "open" && (
        <h3 className="h3">
          Параметры <span></span>
          {activeCamera.name}
        </h3>
      )}
      <NumberFieldInput
        title="Приближение"
        field={{
          onChange: (value) =>
            activeCamera.type == CameraType.Perspective
              ? camera.execute({ id: activeCamera.id, dolly: value })
              : camera.execute({ id: activeCamera.id, zoom: value }),
          isActive: false,
          value:
            activeCamera.type == CameraType.Perspective
              ? activeCamera.dolly
              : activeCamera.zoom,
          range: {
            min: activeCamera.type == CameraType.Perspective ? 0.001 : 1,
            max: activeCamera.type == CameraType.Perspective ? 10 : 10000,
            step: activeCamera.type == CameraType.Perspective ? 0.001 : 10,
            variant: "default",
          },
        }}
        isOpen={mode == "open"}
      />
      <div
        className={clsx(styles.paramsRow, {
          [styles.toColumn]: mode == "close",
        })}
      >
        <NumberFieldInput
          title="Ближняя граница видимости"
          field={{
            onChange: (value) =>
              camera.execute({ id: activeCamera.id, near: value }),
            isActive: false,
            value:
              activeCamera.near > activeCamera.far
                ? activeCamera.far - 100 > 0
                  ? activeCamera.far - 100
                  : 0.1
                : activeCamera.near,
            range: {
              min: activeCamera.type === CameraType.Perspective ? 0.1 : 0,
              max: 10000,
              step: 10,
              variant: "default",
            },
          }}
          isOpen={mode == "open"}
        />
        <NumberFieldInput
          title="Дальняя граница видимости"
          field={{
            onChange: (value) =>
              camera.execute({ id: activeCamera.id, far: value }),
            isActive: false,
            value:
              activeCamera.near > activeCamera.far
                ? activeCamera.near + 100
                : activeCamera.far,
            range: {
              min: activeCamera.type === CameraType.Perspective ? 0.1 : 0,
              max: 10000,
              step: 10,
              variant: "default",
            },
          }}
          isOpen={mode == "open"}
        />
      </div>
      {activeCamera.type == CameraType.Perspective && (
        <SelectLens
          title="Объектив"
          value={activeCamera.fov}
          mode={mode}
          onClick={(v) => camera.execute({ id: activeCamera.id, fov: v })}
        />
      )}

      <ToggleState
        title="Область рендера"
        label="Режим предпросмотра"
        onChange={toggleCameraPreview}
        value={isCameraPreview}
        isOpen={mode == "open"}
      />
      <RatioInput
        title="Соотношение сторон рендера"
        field={{
          onChange: (value: number[]) =>
            camera.execute({ id: activeCamera.id, aspect: value }),
          isActive: false,
          value1: activeCamera.aspect[0],
          value2: activeCamera.aspect[1],
        }}
        isOpen={mode == "open"}
      />
    </div>
  );
}
