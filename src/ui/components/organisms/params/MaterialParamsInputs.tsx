import styles from "./ParamsCommon.module.scss";
import type { Material } from "@/types/scene";
import { useHandlers } from "@/app/ApplicationKernelContext";
import { NumberFieldInput } from "../../molecules/inputs/NumberFieldInput";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import { SelectColor } from "../../atoms/inputs/Selects";
import { getMockFigmaVariables } from "./materialParamsInputs.mocks";
import clsx from "clsx";
import { PickerColor } from "../../molecules/inputs/PickerColor";
import { useSessionStore } from "@/store/sessionStore";

export function MaterialParamsInputs({ material }: { material: Material }) {
  const isParamsClosed = useSessionStore((s) => s.isParamsClosed);
  const isOpen = !isParamsClosed;

  const { materialEditing } = useHandlers();
  const figmaVariables = getMockFigmaVariables();

  return (
    <div
      className={clsx(styles.paramsContainer, {
        [styles.paramsClosed]: isParamsClosed,
      })}
    >
      {isOpen && <h3 className="h3">Параметры {material.name}</h3>}
      {(material.roughness != undefined || material.metalness != undefined) && (
        <div
          className={clsx(styles.paramsRow, {
            [styles.paramsRowClosed]: isParamsClosed,
          })}
        >
          {material.roughness != undefined && (
            <NumberFieldInput
              title={isOpen ? "Шероховатость" : undefined}
              field={{
                onChange: (value) =>
                  materialEditing.execute({
                    id: material.id,
                    roughness: value,
                  }),
                value: material.roughness,
                isActive: false,
                range: isOpen
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
              title={isOpen ? "Металлик" : undefined}
              field={{
                onChange: (value) =>
                  materialEditing.execute({
                    id: material.id,
                    metalness: value,
                  }),
                value: material.metalness,
                isActive: false,
                range: isOpen
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
        title={isOpen ? "Свечение" : undefined}
        field={{
          onChange: (value) =>
            materialEditing.execute({
              id: material.id,
              emissiveIntensity: value,
            }),
          value: material.emissiveIntensity,
          isActive: false,
          range: isOpen
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
        isOpen={isOpen}
      />
      {isOpen && (
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
