import styles from "./Toggles.module.scss";

export function Toggle({
  label,
  onChange,
}: {
  label: string;
  onChange: () => void;
}) {
  return (
    <div className={styles.toggleContainer}>
      <input
        className={styles.toggle}
        type="checkbox"
        role="switch"
        onChange={onChange}
      />
      <p className="t4">{label}</p>
    </div>
  );
}
