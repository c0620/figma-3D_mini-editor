import type { ChangeEvent } from "react";

import styles from "./TextInputs.module.scss";
import { useContext, useEffect, useState } from "react";

import clsx from "clsx";
import { Slider, SliderCentered } from "./Sliders";

export type InputField = {
  onChange: (value: number) => void;
  value: number;
  isActive: boolean;
  label?: string;
  range?: {
    min: number;
    max: number;
    step: number;
    variant: "default" | "centered";
  };
};

export function InputNumbers({ field }: { field: InputField }) {
  const [cachedValue, setCachedValue] = useState("" + field.value);
  useEffect(() => setCachedValue("" + field.value), [field.value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCachedValue(e.target.value.replace(",", "."));
  };

  const setChange = () => {
    const parsed = Number.parseFloat(cachedValue);
    if (Number.isFinite(parsed)) field.onChange(parsed);
    else setCachedValue("" + field.value);
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
        value={cachedValue}
        onBlur={setChange}
      />
    </div>
  );
}

export function InputMultipleText() {}

export function InputProjectName() {}

export function InputModelSource() {}
