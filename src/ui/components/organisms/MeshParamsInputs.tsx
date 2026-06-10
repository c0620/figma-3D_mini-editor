import { useContext, useState } from "react";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";
import { InputText } from "../atoms/inputs/TextInputs";

import { activeEntityEditorHeading } from "./TransformInputs";
import { Slider } from "../atoms/inputs/Sliders";
import type { ActiveEntity } from "@/app/ApplicationKernelContext";

import styles from "./MeshParamsInputs.module.scss";

export function MeshParamsInputs({ activeObj }: { activeObj: ActiveEntity }) {
  const mode = useContext(PanelSceneModeContext);

  const [roughness, setRoughness] = useState(0);
  const [metallic, setMetallic] = useState(0);
  const [emission, setEmission] = useState(0);

  var fields = {
    onChange: (value) => setRoughness(value),
    value: roughness,
    isActive: false,
  };
  return (
    <div>
      <h3 className="h3">
        Параметры <span></span>materialname
      </h3>
      <div className={styles.paramsRow}>
        <InputText
          field={{
            onChange: (value) => setRoughness(value),
            value: roughness,
            isActive: false,
            range: {
              min: 0,
              max: 10,
              variant: "default",
              step: 1,
            },
          }}
        />
        <InputText
          field={{
            onChange: (value) => setRoughness(value),
            value: roughness,
            isActive: false,
            range: {
              min: 0,
              max: 10,
              variant: "default",
              step: 1,
            },
          }}
        />
      </div>
      <InputText
        field={{
          onChange: (value) => setRoughness(value),
          value: roughness,
          isActive: false,
          range: {
            min: 0,
            max: 10,
            variant: "default",
            step: 1,
          },
        }}
      />
    </div>
  );
}
