import { useEffect, useState } from "react";
import { Slider, SliderCentered } from "../../atoms/inputs/Sliders";
import {
  InputNumbers,
  type InputNumbersField,
} from "../../atoms/inputs/TextInputs";
import styles from "./NumberFieldInput.module.scss";

export function NumberFieldInput({
  title,
  field,
}: {
  title?: string;
  field: Omit<InputNumbersField, "setValue" | "value"> & { value: number };
}) {
  const [value, setValue] = useState("" + field.value);
  useEffect(() => setValue("" + field.value), [field.value]);
  const inputField: InputNumbersField = {
    ...field,
    value: value,
    setValue: setValue,
  };
  return (
    <div className={styles.numberInputContainer}>
      <p className="t3">{title}</p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--margin-s)",
        }}
      >
        <InputNumbers field={inputField} />
        {field.range &&
          (field.range.variant == "default" ? (
            <Slider field={inputField} />
          ) : (
            <SliderCentered field={inputField} />
          ))}
      </div>
    </div>
  );
}
