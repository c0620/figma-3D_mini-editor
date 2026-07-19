import { Toggle } from "../../atoms/inputs/Toggles";
import styles from "./ToggleState.module.scss";

export function ToggleState({
  title,
  label,
  onChange,
}: {
  title: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <div className={styles.toggleState}>
      <p className="t3">{title}</p>
      <Toggle label={label} onChange={onChange} />
    </div>
  );
}
