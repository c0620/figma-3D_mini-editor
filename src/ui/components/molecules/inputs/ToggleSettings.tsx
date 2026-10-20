import { Toggle } from "@/ui/components/atoms/inputs/Toggles";
import styles from "./Settings.module.scss";
import clsx from "clsx";

export function ToggleSettings({
  title,
  label,
  onChange,
  value,
  frozen,
}: {
  title: string;
  label?: string;
  onChange: () => void;
  value: boolean;
  frozen: boolean;
}) {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.description}>
        <h3 className="h3">{title}</h3>
        {label && <p className="t2">{label}</p>}
      </div>
      <Toggle
        onChange={onChange}
        value={value}
        className={clsx(styles.toggleReset, { [styles.toggleFrozen]: frozen })}
      />
    </div>
  );
}
