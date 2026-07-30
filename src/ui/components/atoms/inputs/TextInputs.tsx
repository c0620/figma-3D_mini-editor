import type { ChangeEvent } from "react";

import styles from "./TextInputs.module.scss";
import { useId } from "react";

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

export type InputPairNumbersField = {
  onChange: (value: number[]) => void;
  value1: number;
  value2: number;
  isActive: boolean;
};

export function InputNumbers({ field }: { field: InputNumbersField }) {
  const id = useId();

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
        <label className={styles.inputTextLabel} htmlFor={id}>
          {field.label}
        </label>
      ) : null}
      <input
        className={styles.inputTextField}
        id={id}
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

export function InputPairNumbers({
  field,
  vertical = false,
}: {
  field: InputPairNumbersField;
  vertical?: boolean;
}) {
  return (
    <div className={vertical ? styles.vertical : styles.pairRow} role="group">
      <input
        className={styles.inputTextField}
        value={field.value1}
        onChange={(e) => field.onChange([+e.target.value, field.value2])}
      />
      <input
        className={styles.inputTextField}
        value={field.value2}
        onChange={(e) => field.onChange([field.value1, +e.target.value])}
      />
    </div>
  );
}

export function InputMultipleText() {}

export function InputProjectName() {}

export function InputModelSource() {}
