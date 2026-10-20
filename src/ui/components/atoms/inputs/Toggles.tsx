import clsx from "clsx";
import styles from "./Toggles.module.scss";

export function Toggle({
  label,
  onChange,
  value,
  className,
}: {
  label?: string;
  value: boolean;
  onChange: () => void;
  className?: string;
}) {
  return (
    <div className={clsx(styles.toggleContainer, className && className)}>
      <input
        className={styles.toggle}
        type="checkbox"
        role="switch"
        checked={value}
        onChange={onChange}
      />
      {label && <p className="t4">{label}</p>}
    </div>
  );
}
