import { useContext, useState } from "react";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";

import { activeEntityEditorHeading } from "./TransformInputs";
import { Slider } from "../atoms/inputs/Sliders";

import styles from "./MaterialParamsInputs.module.scss";
import type { Material, SceneMesh } from "@/types/scene";
import { useHandlers } from "@/app/ApplicationKernelContext";
import { NumberFieldInput } from "../molecules/inputs/NumberFieldInput";
import { ColorInput } from "../molecules/inputs/ColorInput";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";

export function MaterialParamsInputs({ material }: { material: Material }) {
  const mode = useContext(PanelSceneModeContext);
  const { materialEditing } = useHandlers();

  return (
    <div className={styles.materialParams}>
      <h3 className="h3">
        Параметры <span></span>materialname
      </h3>
      <div className={styles.paramsRow}>
        <NumberFieldInput
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
              step: 0.1,
              onDrag: (value) =>
                threeAssetRegistry.setParam(material.id, { roughness: value }),
            },
          }}
        />
        <NumberFieldInput
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
              step: 0.1,
              onDrag: (value) =>
                threeAssetRegistry.setParam(material.id, { metalness: value }),
            },
          }}
        />
      </div>
      <NumberFieldInput
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
            step: 0.01,
            onDrag: (value) =>
              threeAssetRegistry.setParam(material.id, {
                emissiveIntensity: value,
              }),
          },
        }}
      />
      <ColorInput
        title="Основной цвет"
        value={material.color}
        onChange={(value: Material["color"]) =>
          materialEditing.execute({ id: material.id, color: value })
        }
        onPalette={(value: Material["color"]) => {
          threeAssetRegistry.setParam(material.id, { color: value });
        }}
      />
    </div>
  );
}
