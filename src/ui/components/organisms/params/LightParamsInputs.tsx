import { LightType, type SceneLight } from "@/types/scene";
import { NumberFieldInput } from "../../molecules/inputs/NumberFieldInput";
import { useHandlers } from "@/app/ApplicationKernelContext";
import { PickerColor } from "../../molecules/inputs/PickerColor";
import { SelectColor } from "../../atoms/inputs/Selects";
import { type LightPatch } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";
import { useViewportObjectStore } from "@/store/viewportObjectStore";
import type { InputNumbersField } from "../../atoms/inputs/TextInputs";
import type { SpotLight } from "three";
import { getMockFigmaVariables } from "./materialParamsInputs.mocks";
import styles from "./ParamsCommon.module.scss";
import clsx from "clsx";
import { SelectLightTarget } from "../../molecules/inputs/SelectLightTarget";

type LightNumberKey = "intensity" | "distance" | "decay" | "angle" | "penumbra";

function lightNumberField(
  patch: (changes: LightPatch) => void,
  key: LightNumberKey,
  value: number,
  range: Omit<NonNullable<InputNumbersField["range"]>, "variant">
) {
  return {
    isActive: false as const,
    value,
    onChange: (next: number) => patch({ [key]: next }),
    range: { ...range, variant: "default" as const },
  };
}

export function LightParamsInputs({
  activeLight,
}: {
  activeLight: SceneLight;
}) {
  const { lightEditing } = useHandlers();
  const isParamsClosed = useSessionStore((s) => s.isParamsClosed);
  const isOpen = !isParamsClosed;

  const patch = (changes: LightPatch) =>
    lightEditing.execute({ id: activeLight.id, changes });

  const dragPatch = (changes: LightNumberKey, value: number) => {
    const light = useViewportObjectStore.getState().lights[
      activeLight.id
    ] as SpotLight;
    if (light) light[changes] = value;
  };

  const isPoint = activeLight.type === LightType.Point;
  const isSpot = activeLight.type === LightType.Spot;

  return (
    <div
      className={clsx(styles.paramsContainer, {
        [styles.paramsClosed]: isParamsClosed,
      })}
    >
      {isOpen && <h3 className="h3">Параметры освещения</h3>}
      <NumberFieldInput
        title="Сила свечения"
        field={lightNumberField(patch, "intensity", activeLight.intensity, {
          min: 0,
          max: 1000,
          step: 1,
          onDrag: (value) => dragPatch("intensity", value),
        })}
        isOpen={isOpen}
      />
      {isPoint && (
        <>
          <NumberFieldInput
            title="Дальность затухания"
            field={lightNumberField(patch, "distance", activeLight.distance, {
              min: 0,
              max: 100,
              step: 0.1,
              onDrag: (value) => dragPatch("distance", value),
            })}
            isOpen={isOpen}
          />
          <NumberFieldInput
            title="Сила рассеивания"
            field={lightNumberField(patch, "decay", activeLight.decay, {
              min: 0,
              max: 10,
              step: 0.1,
              onDrag: (value) => dragPatch("decay", value),
            })}
            isOpen={isOpen}
          />
        </>
      )}

      {isSpot && (
        <>
          <NumberFieldInput
            title="Дальность затухания"
            field={lightNumberField(patch, "distance", activeLight.distance, {
              min: 0,
              max: 100,
              step: 0.1,
              onDrag: (value) => dragPatch("distance", value),
            })}
            isOpen={isOpen}
          />
          <div
            className={clsx(styles.paramsRow, {
              [styles.paramsRowClosed]: !isOpen,
            })}
          >
            <NumberFieldInput
              title="Сила рассеивания"
              field={lightNumberField(patch, "decay", activeLight.decay, {
                min: 0,
                max: 10,
                step: 0.1,
                onDrag: (value) => dragPatch("decay", value),
              })}
              isOpen={isOpen}
            />
            <NumberFieldInput
              title="Угол рассеивания"
              field={lightNumberField(patch, "angle", activeLight.angle, {
                min: 0,
                max: Math.PI / 2,
                step: 0.01,
                onDrag: (value) => dragPatch("angle", value),
              })}
              isOpen={isOpen}
            />
          </div>
          <NumberFieldInput
            title="Полутень"
            field={lightNumberField(patch, "penumbra", activeLight.penumbra, {
              min: 0,
              max: 1,
              step: 0.01,
              onDrag: (value) => dragPatch("penumbra", value),
            })}
            isOpen={isOpen}
          />
          {isOpen && (
            <SelectLightTarget
              title={"Направление света"}
              target={activeLight.target}
              isOpen={isOpen}
              onClick={(value) => patch({ target: value })}
            />
          )}
        </>
      )}

      <PickerColor
        title="Основной цвет"
        onChange={(value) => patch({ color: value })}
        onPalette={(value) => {
          const light =
            useViewportObjectStore.getState().lights[activeLight.id];
          if (light) light.color.set(value.value);
        }}
        value={activeLight.color.value}
        isOpen={isOpen}
      />
      {isOpen && (
        <SelectColor
          variables={getMockFigmaVariables()}
          value={activeLight.color}
          onChange={(value: SceneLight["color"]) => patch({ color: value })}
        />
      )}
    </div>
  );
}
