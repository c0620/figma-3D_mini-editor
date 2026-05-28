import { useCallback, useEffect } from "react";

import { useI18n } from "@/app/ApplicationKernelContext";
import styles from "./ExportSuccessModal.module.css";

export function ExportSuccessModal({ onClose }: { onClose?: () => void }) {
  const { t } = useI18n();

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-success-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.copy}>
          <h2 id="export-success-title" className={styles.title}>
            {t("export.success.title")}
          </h2>
          <p className={styles.body}>{t("export.success.body")}</p>
        </div>
        <button type="button" className={styles.cta} onClick={handleClose}>
          {t("export.success.cta")}
        </button>
      </div>
    </div>
  );
}
