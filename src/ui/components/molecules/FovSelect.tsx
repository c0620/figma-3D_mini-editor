import { useEffect, useRef, useState } from "react";
import {
  FOV_PRESETS,
  findExactFovPreset,
  findNearestFovPreset,
  lensIcon,
} from "@/camera/fovPresets";
import { useI18n } from "@/app/ApplicationKernelContext";
import styles from "./FovSelect.module.css";

export function FovSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (fov: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activePreset = findExactFovPreset(value) ?? findNearestFovPreset(value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          className={styles.triggerIcon}
          src={activePreset?.icon ?? lensIcon}
          alt=""
        />
        <span className={styles.triggerLabel}>
          {t(activePreset.labelKey)}
        </span>
        <span className={styles.chevron} aria-hidden />
      </button>

      {open ? (
        <ul className={styles.menu} role="listbox">
          {FOV_PRESETS.map((preset) => {
            const selected = preset.id === activePreset.id;
            return (
              <li key={preset.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={
                    selected ? `${styles.option} ${styles.optionActive}` : styles.option
                  }
                  onClick={() => {
                    onChange(preset.fov);
                    setOpen(false);
                  }}
                >
                  <img className={styles.optionIcon} src={preset.icon} alt="" />
                  <span>{t(preset.labelKey)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
