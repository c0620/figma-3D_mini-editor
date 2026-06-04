import { useContext } from "react";
import { InputText, Slider, SliderCentered } from "./Input";
import type { PanelMode } from "../types/panel";
import { PanelSceneModeContext } from "../organisms/panels/BasePanel";
import { ActionButton } from "./Button";

import styles from "./EditorInput.module.scss";
import clsx from "clsx";

export type InputField = {
  onChange: (value: number) => void;
  value: number;
  isActive: boolean;
  label?: string;
};

export function PanelModeButtton({
  text,
  img,
  onClick,
}: {
  text?: string;
  img?: string;
  onClick: () => void;
}) {
  const mode = useContext(PanelSceneModeContext);

  if (mode == "close") return <ActionButton onClick={onClick} img={img} />;
  return <ActionButton onClick={onClick} text={text} />;
}

export function ObjectNumberInput({
  mode,
  fields,
  groupLabel,
  sliderType,
}: {
  mode: PanelMode;
  fields: Array<InputField>;
  groupLabel: string;
  sliderType: "default" | "centered" | null;
}) {
  const inputs = fields.map((field) => {
    const { label, ...clearField } = field;
    return <InputText field={mode == "open" ? field : clearField} />;
  });
  const slider = sliderType ? (
    sliderType === "default" ? (
      <Slider />
    ) : (
      <SliderCentered />
    )
  ) : (
    ""
  );

  return (
    <div>
      {mode == "open" && <p className={styles.groupLabel}>{groupLabel}</p>}
      <div
        className={clsx(styles.numberInputs, {
          [styles.vertical]: mode == "close",
        })}
      >
        {inputs} {mode == "open" && slider}
      </div>
    </div>
  );
}

export function ObjectColorInput() {}

export function ObjectRatioInput() {}

export function MeshMaterialSelect() {}

export function TextureSelect() {}

export function Options() {}

export function ModeSelect() {}
