import { useContext, useState } from "react";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";
import { InputNumbers, type InputField } from "../atoms/inputs/TextInputs";

import { activeEntityEditorHeading } from "./TransformInputs";
import { Slider } from "../atoms/inputs/Sliders";

import styles from "./MaterialParamsInputs.module.scss";
import type { Material, SceneMesh } from "@/types/scene";
import { useHandlers } from "@/app/ApplicationKernelContext";

function MaterialParam({ title, field }: { title: string; field: InputField }) {
  return (
    <div>
      <p className="t3">{title}</p>
      <InputNumbers field={field} />
    </div>
  );
}

export function MaterialParamsInputs({ material }: { material: Material }) {
  const mode = useContext(PanelSceneModeContext);
  const { materialEditing } = useHandlers();

  return (
    <div className={styles.materialParams}>
      <h3 className="h3">
        Параметры <span></span>materialname
      </h3>
      <div className={styles.paramsRow}>
        <MaterialParam
          title="Шероховатость"
          field={{
            onChange: (value) =>
              materialEditing.execute({ id: material.id, roughness: value }),
            value: material.roughness,
            isActive: false,
            range: {
              min: 0,
              max: 10,
              variant: "default",
              step: 1,
            },
          }}
        />
        <MaterialParam
          title="Металлик"
          field={{
            onChange: (value) =>
              materialEditing.execute({ id: material.id, metalness: value }),
            value: material.metalness,
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
      <MaterialParam
        title="Свечение"
        field={{
          onChange: (value) =>
            materialEditing.execute({
              id: material.id,
              emissiveIntensity: value,
            }),
          value: material.emissiveIntensity,
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
