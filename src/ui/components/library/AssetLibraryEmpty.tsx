import { useI18n } from "@/app/ApplicationKernelContext";
import styles from "./AssetLibrary.module.css";

export function AssetLibraryEmpty() {
  const { t } = useI18n();
  return <p className={styles.empty}>{t("library.empty")}</p>;
}
