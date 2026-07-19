import { useEffect, useState } from "react";
import { Slider } from "../../atoms/inputs/Sliders";
import {
  InputNumbers,
  type InputNumbersField,
} from "../../atoms/inputs/TextInputs";
import styles from "./Common.module.scss";

export function NumberFieldInput({
  title,
  field,
}: {
  title?: string;
  field: Omit<InputNumbersField, "setValue" | "value"> & { value: number };
  pair?: boolean;
}) {
  const [value, setValue] = useState("" + field.value);
  useEffect(() => setValue("" + field.value), [field.value]);
  const inputField: InputNumbersField = {
    ...field,
    value: value,
    setValue: setValue,
  };
  return (
    <div className={styles.commonContainer}>
      <p className="t3">{title}</p>
      <div className={styles.commonInputRow}>
        <InputNumbers field={inputField} />
        {field.range && field.range.variant == "default" && (
          <Slider field={inputField} />
        )}
      </div>
    </div>
  );
}
