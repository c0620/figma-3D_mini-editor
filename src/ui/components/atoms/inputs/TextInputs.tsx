import type { ChangeEvent, InputEvent, InputEventHandler } from "react";

import styles from "./TextInputs.module.scss";
import { useId } from "react";
import clsx from "clsx";

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

export type InputPairValues =
  | [val1: number, val2: undefined]
  | [val1: undefined, val2: number]
  | [val1: number, val2: number];

export type InputPairNumbersField = {
  onChange: (...vals: InputPairValues) => void;
  value1: number;
  value2: number;
  isActive: boolean;
  label1?: string;
  label2?: string;
};

export function InputNumbers({ field }: { field: InputNumbersField }) {
  const id = useId();

  const handleChange = (e: InputEvent<HTMLInputElement>) => {
    field.setValue(e.currentTarget.value.replace(",", "."));
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
  className,
}: {
  field: InputPairNumbersField;
  vertical?: boolean;
  className?: string;
}) {
  const id1 = useId();
  const id2 = useId();
  return (
    <div
      className={clsx(
        vertical ? styles.vertical : styles.pairRow,
        className && className
      )}
      role="group"
    >
      {field.label1 ? (
        <label className={styles.inputTextLabel} htmlFor={id1}>
          {field.label1}
        </label>
      ) : null}
      <input
        id={id1}
        className={styles.inputTextField}
        value={field.value1}
        onChange={(e) =>
          !Number.isNaN(+e.target.value) &&
          field.onChange(+e.target.value, undefined)
        }
      />

      {field.label2 ? (
        <label className={styles.inputTextLabel} htmlFor={id2}>
          {field.label2}
        </label>
      ) : null}
      <input
        id={id2}
        className={styles.inputTextField}
        value={field.value2}
        onChange={(e) =>
          !Number.isNaN(+e.target.value) &&
          field.onChange(undefined, +e.target.value)
        }
      />
    </div>
  );
}

export function InputMultipleText() {}

export function InputProjectName() {}

export function InputModelSource() {}
