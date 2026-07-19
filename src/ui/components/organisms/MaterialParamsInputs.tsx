import { useContext } from "react";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";

import styles from "./MaterialParamsInputs.module.scss";
import type { Material } from "@/types/scene";
import { useHandlers } from "@/app/ApplicationKernelContext";
import { NumberFieldInput } from "../molecules/inputs/NumberFieldInput";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import { SelectColor } from "../atoms/inputs/Selects";
import { getMockFigmaVariables } from "./materialParamsInputs.mocks";
import clsx from "clsx";
import { PickerColor } from "../molecules/inputs/PickerColor";

export function MaterialParamsInputs({ material }: { material: Material }) {
  const mode = useContext(PanelSceneModeContext);

  const { materialEditing } = useHandlers();
  const figmaVariables = getMockFigmaVariables();

  return (
    <div
      className={clsx(styles.materialParams, {
        [styles.materialParamsClosed]: mode == "close",
      })}
    >
      {mode == "open" && (
        <h3 className="h3">
          Параметры <span></span>materialname
        </h3>
      )}
      {(material.roughness != undefined || material.metalness != undefined) && (
        <div
          className={clsx(styles.paramsRow, {
            [styles.paramsRowClosed]: mode == "close",
          })}
        >
          {material.roughness != undefined && (
            <NumberFieldInput
              title={mode == "open" ? "Шероховатость" : undefined}
              field={{
                onChange: (value) =>
                  materialEditing.execute({
                    id: material.id,
                    roughness: value,
                  }),
                value: material.roughness,
                isActive: false,
                range:
                  mode == "open"
                    ? {
                        min: 0,
                        max: 10,
                        variant: "default",
                        step: 0.1,
                        onDrag: (value) =>
                          threeAssetRegistry.setParam(material.id, {
                            roughness: value,
                          }),
                      }
                    : undefined,
              }}
            />
          )}

          {material.metalness != undefined && (
            <NumberFieldInput
              title={mode == "open" ? "Металлик" : undefined}
              field={{
                onChange: (value) =>
                  materialEditing.execute({
                    id: material.id,
                    metalness: value,
                  }),
                value: material.metalness,
                isActive: false,
                range:
                  mode == "open"
                    ? {
                        min: 0,
                        max: 10,
                        variant: "default",
                        step: 0.1,
                        onDrag: (value) =>
                          threeAssetRegistry.setParam(material.id, {
                            metalness: value,
                          }),
                      }
                    : undefined,
              }}
            />
          )}
        </div>
      )}

      <NumberFieldInput
        title={mode == "open" ? "Свечение" : undefined}
        field={{
          onChange: (value) =>
            materialEditing.execute({
              id: material.id,
              emissiveIntensity: value,
            }),
          value: material.emissiveIntensity,
          isActive: false,
          range:
            mode == "open"
              ? {
                  min: 0,
                  max: 10,
                  variant: "default",
                  step: 0.01,
                  onDrag: (value) =>
                    threeAssetRegistry.setParam(material.id, {
                      emissiveIntensity: value,
                    }),
                }
              : undefined,
        }}
      />
      <PickerColor
        title="Основной цвет"
        value={material.color.value}
        onChange={(value: Material["color"]) =>
          materialEditing.execute({ id: material.id, color: value })
        }
        onPalette={(value: Material["color"]) => {
          threeAssetRegistry.setParam(material.id, { color: value.value });
        }}
        mode={mode}
      />
      {mode == "open" && (
        <SelectColor
          variables={figmaVariables}
          value={material.color}
          onChange={(value: Material["color"]) =>
            materialEditing.execute({ id: material.id, color: value })
          }
        />
      )}
    </div>
  );
}
