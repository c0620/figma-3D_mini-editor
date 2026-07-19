import type { SceneCamera } from "@/types/scene";
import { NumberFieldInput } from "../molecules/inputs/NumberFieldInput";
import styles from "./CameraParamsInputs.module.scss";
import { ToggleState } from "../molecules/inputs/ToggleState";

import { useContext, useState } from "react";
import { RatioInput } from "../molecules/inputs/RatioInput";
import { SelectLens } from "../molecules/inputs/SelectLens";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";

export function CameraParamsInputs({ camera }: { camera: SceneCamera }) {
  const mode = useContext(PanelSceneModeContext);

  const [near, setNear] = useState(camera.type === "Perspective" ? 0.1 : 0);
  const [far, setFar] = useState(1000);
  const [ratio, setRatio] = useState([1, 1]);

  return (
    <div className={styles.cameraParams}>
      <h3 className="h3">
        Параметры <span></span>
        {camera.name}
      </h3>
      <NumberFieldInput
        title="Приближение"
        field={{
          onChange: (value) => console.log(value),
          isActive: false,
          value: camera.zoom,
          range: {
            min: 0,
            max: 10000,
            step: 10,
            variant: "default",
          },
        }}
      />
      <div className={styles.paramsRow}>
        <NumberFieldInput
          title="Ближняя граница видимости"
          field={{
            onChange: (value) => {
              setNear(value);
              console.log(value);
            },
            isActive: false,
            value: near,
            range: {
              min: camera.type === "Perspective" ? 0.1 : 0,
              max: 10000,
              step: 10,
              variant: "default",
            },
          }}
        />
        <NumberFieldInput
          title="Дальняя граница видимости"
          field={{
            onChange: (value) => {
              setFar(value);
              console.log(value);
            },
            isActive: false,
            value: far,
            range: {
              min: 0,
              max: 10000,
              step: 10,
              variant: "default",
            },
          }}
        />
      </div>
      <SelectLens title="Объектив" value="35mm" mode={mode} />
      <ToggleState
        title="Область рендера"
        label="Режим предпросмотра"
        onChange={() => console.log("test")}
      />
      <RatioInput
        title="Соотношение сторон рендера"
        field={{
          onChange: (value: number[]) => setRatio(value),
          isActive: false,
          value1: ratio[0],
          value2: ratio[1],
          setValues: setRatio,
        }}
      />
    </div>
  );
}
