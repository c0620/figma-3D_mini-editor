import styles from "./Toggles.module.scss";

export function Toggle({
  label,
  onChange,
  value,
}: {
  label?: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.toggleContainer}>
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
