import { useId, useState } from "react";
import { useI18n } from "@/app/ApplicationKernelContext";
import type { TranslationKey } from "@/i18n/en";
import infoIcon from "@/assets/images/icons/descriptive/info.svg";
import styles from "./ParamHelpPopover.module.css";

export function ParamHelpPopover({
  titleKey,
  bodyKey,
}: {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const popoverId = useId();

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <div
      className={styles.root}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={t(titleKey)}
        aria-describedby={open ? popoverId : undefined}
      >
        <img src={infoIcon} alt="" />
      </button>
      {open ? (
        <div className={styles.popover} id={popoverId} role="tooltip">
          <p className={styles.popoverTitle}>{t(titleKey)}</p>
          <p className={styles.popoverBody}>{t(bodyKey)}</p>
        </div>
      ) : null}
    </div>
  );
}
