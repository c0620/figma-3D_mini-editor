import {
  InputNumbers,
  InputPairNumbers,
  type InputPairNumbersField,
  type InputPairValues,
} from "@atoms/inputs/TextInputs";
import styles from "./Settings.module.scss";
import reset from "./NumberFieldSettings.module.scss";
import { useEffect, useState, type SetStateAction } from "react";

export function NumberFieldPairSettings({
  title,
  label,
  field,
}: {
  title: string;
  label: string;
  labelInput?: string;
  field: Omit<InputPairNumbersField, "setValues">;
}) {
  useEffect(
    () => setValues([field.value1, field.value2]),
    [field.value1, field.value2]
  );
  const [values, setValues] = useState<[string, string]>([
    field.value1,
    field.value2,
  ]);

  const inputField: InputPairNumbersField = {
    ...field,
    setValues: setValues,
    value1: values[0],
    value2: values[1],
  };
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.description}>
        <h3 className="h3">{title}</h3>
        {label && <p className="t2">{label}</p>}
      </div>
      <InputPairNumbers field={inputField} className={reset.container} />
    </div>
  );
}
