import type { ChangeEvent } from "react";

import styles from "./TextInputs.module.scss";
import { useContext, useEffect, useState } from "react";

import clsx from "clsx";
import { Slider, SliderCentered } from "./Sliders";

export type InputNumbersField = {
  onChange: (value: number) => void;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  isActive: boolean;
  label?: string;
  range?: {
    min: number;
    max: number;
    step: number;
    variant: "default" | "centered";
    onDrag?: (value: number) => void;
  };
};

export function InputNumbers({ field }: { field: InputNumbersField }) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    field.setValue(e.target.value.replace(",", "."));
  };

  const setChange = () => {
    const parsed = Number.parseFloat(field.value);
    if (Number.isFinite(parsed)) field.onChange(parsed);
    else field.setValue("" + field.value);
  };

  return (
    <div className={styles.inputText}>
      {field.label ? (
        <label className={styles.inputTextLabel}>{field.label}</label>
      ) : null}
      <input
        className={styles.inputTextField}
        type="number"
        style={field.isActive ? { color: "orange" } : { color: "white" }}
        onInput={handleChange}
        onKeyDown={(e) => {
          if (e.code === "Enter") setChange();
        }}
        value={field.value}
        onBlur={setChange}
      />
    </div>
  );
}

export function InputMultipleText() {}

export function InputProjectName() {}

export function InputModelSource() {}
