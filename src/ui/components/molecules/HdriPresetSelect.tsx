import { useEffect, useState } from "react";

import { useI18n, usePreview } from "@/app/ApplicationKernelContext";
import { HDRI_PRESETS } from "@/lights/hdriPresets";
import type { HdriPresetId } from "@/types/scene";
import graphStyles from "../atoms/SceneGraph.module.css";
import styles from "./CameraTypeSelect.module.css";
import hdriStyles from "./HdriPresetSelect.module.css";

function HdriPresetIcon({
  presetId,
  active,
}: {
  presetId: HdriPresetId;
  active: boolean;
}) {
  const preview = usePreview();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void preview
      .renderHdriPreset(presetId, { format: "dataUrl" })
      .then((url) => {
        if (!cancelled) setSrc(url as string);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [preview, presetId]);

  const iconWrapClass = [
    graphStyles.iconWrap,
    hdriStyles.iconWrap,
    active ? styles.iconWrapActive : styles.iconWrapIdle,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={iconWrapClass}>
      {src ? (
        <img className={hdriStyles.preview} src={src} alt="" />
      ) : (
        <span className={hdriStyles.placeholder} aria-hidden />
      )}
    </span>
  );
}

export function HdriPresetSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: HdriPresetId;
  onChange: (preset: HdriPresetId) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className={styles.list}
      role="listbox"
      aria-label={t("light.hdriPreset.title")}
    >
      {HDRI_PRESETS.map((preset) => {
        const selected = value === preset.id;
        const optionClass = [
          styles.option,
          selected ? styles.optionActive : styles.optionIdle,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={preset.id}
            type="button"
            role="option"
            aria-selected={selected}
            className={optionClass}
            disabled={disabled}
            onClick={() => onChange(preset.id)}
          >
            <HdriPresetIcon presetId={preset.id} active={selected} />
            <span className={styles.label}>{t(preset.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
