import styles from "./Loader.module.scss";

export function Loader() {
  return (
    <div className={styles.loader}>
      <svg viewBox="0 0 121 121">
        <path
          d="M 10 60 A 50 50 0 1 1 10 61"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
