import styles from "./BaseModalMini.module.scss";

export function BaseModalMini({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.window}>{children}</div>
    </div>
  );
}
