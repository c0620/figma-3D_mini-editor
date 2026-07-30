import { Toggle } from "../../atoms/inputs/Toggles";
import styles from "./ToggleState.module.scss";

export function ToggleState({
  title,
  label,
  onChange,
  value,
  isOpen = true,
}: {
  title: string;
  label: string;
  onChange: () => void;
  value: boolean;
  isOpen?: boolean;
}) {
  return (
    <div className={styles.toggleState}>
      {isOpen && <p className="t3">{title}</p>}
      <Toggle
        label={isOpen ? label : undefined}
        onChange={onChange}
        value={value}
      />
    </div>
  );
}
