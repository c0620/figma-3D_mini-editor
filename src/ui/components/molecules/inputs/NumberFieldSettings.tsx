import {
  InputNumbers,
  InputPairNumbers,
  type InputPairValues,
} from "../../atoms/inputs/TextInputs";
import styles from "./Settings.module.scss";
import reset from "./NumberFieldSettings.module.scss";

export function NumberFieldPairSettings({
  title,
  label,
  value1,
  value2,
  onChange,
  label1,
  label2,
}: {
  title: string;
  label: string;
  labelInput?: string;
  value1: number;
  value2: number;
  onChange: (...vals: InputPairValues) => void;
  label1?: string;
  label2?: string;
}) {
  const field = {
    onChange,
    value1,
    value2,
    isActive: true,
    label1,
    label2,
  };
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.description}>
        <h3 className="h3">{title}</h3>
        {label && <p className="t2">{label}</p>}
      </div>
      <InputPairNumbers field={field} className={reset.container} />
    </div>
  );
}
