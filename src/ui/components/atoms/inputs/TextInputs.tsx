import type { ChangeEvent, InputEvent, InputEventHandler } from "react";

import styles from "./TextInputs.module.scss";
import { useId } from "react";
import clsx from "clsx";

export type InputNumbersField = {
  onApply: (value: number) => void;
  beforeApply?: (value: number) => number;
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
  onApply: (...vals: InputPairValues) => void;
  beforeApply?: (...vals: [number, number]) => [number, number];
  setValues: React.Dispatch<React.SetStateAction<[string, string]>>;
  value1: string;
  value2: string;
  isActive: boolean;
  label1?: string;
  label2?: string;
};

function setNumberValueAsString(value: string, last: string) {
  // skips negative numbers because the leading '-' isn't handled
  // validates only pasted numbers, or a '-' added to the start of an existing number
  const numeric = value.replaceAll(",", ".").replaceAll(" ", "");

  if (Number.isFinite(Number(numeric)) || numeric === "") {
    if (numeric === "") {
      return "0";
    } else if (numeric.endsWith(".")) {
      return numeric;
    } else {
      return parseFloat(numeric) + "";
    }
  }
  return last;
}

export function InputNumbers({ field }: { field: InputNumbersField }) {
  const id = useId();

  const applyChange = () => {
    let parsed = Number.parseFloat(field.value);
    if (Number.isFinite(parsed)) {
      if (field.beforeApply) {
        parsed = field.beforeApply(parsed);
      }
      field.onApply(parsed);
      field.setValue(parsed + "");
    }
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
        type="text"
        style={field.isActive ? { color: "orange" } : { color: "white" }}
        onInput={(e) =>
          field.setValue(
            setNumberValueAsString(e.currentTarget.value, field.value)
          )
        }
        onKeyDown={(e) => {
          if (e.code === "Enter") applyChange();
        }}
        value={field.value}
        onBlur={applyChange}
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

  const applyChange = (...values: InputPairValues) => {
    let [val1, val2] = values;
    let pair: [number, number];
    let apply = values;

    if (Number.isFinite(val1) || Number.isFinite(val2)) {
      if (val1 !== undefined && val2 !== undefined) {
        pair = [val1, val2];
      } else if (val1 !== undefined) {
        pair = [val1, +field.value2];
      } else {
        pair = [+field.value1, val2!];
      }
      if (field.beforeApply) {
        apply = field.beforeApply(...pair);
      } else apply = pair;
    } else {
      pair = [+field.value1, +field.value2];
      apply = [+field.value1, +field.value2];
    }
    if (!pair.every(Number.isFinite)) return;
    field.onApply(
      ...([
        val1 == undefined ? val1 : apply[0],
        val2 == undefined ? val2 : apply[1],
      ] as InputPairValues)
    );
    field.setValues([apply[0] + "", apply[1] + ""]);
  };

  return (
    <div
      className={clsx(vertical ? styles.vertical : styles.pairRow, className)}
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
        type="text"
        value={field.value1}
        onInput={(e) =>
          field.setValues([
            setNumberValueAsString(e.currentTarget.value, field.value1),
            field.value2,
          ])
        }
        onKeyDown={(e) => {
          if (e.code === "Enter") applyChange(+field.value1, undefined);
        }}
        onBlur={() => applyChange(+field.value1, undefined)}
      />

      {field.label2 ? (
        <label className={styles.inputTextLabel} htmlFor={id2}>
          {field.label2}
        </label>
      ) : null}
      <input
        id={id2}
        className={styles.inputTextField}
        type="text"
        value={field.value2}
        onInput={(e) => {
          e.currentTarget.value;
          field.setValues([
            field.value1,
            setNumberValueAsString(e.currentTarget.value, field.value2),
          ]);
        }}
        onKeyDown={(e) => {
          if (e.code === "Enter") applyChange(undefined, +field.value2);
        }}
        onBlur={() => applyChange(undefined, +field.value2)}
      />
    </div>
  );
}

export function InputMultipleText() {}

export function InputProjectName() {}

export function InputModelSource() {}
