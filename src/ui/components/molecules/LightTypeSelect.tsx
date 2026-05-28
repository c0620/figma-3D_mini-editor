import { useI18n } from "@/app/ApplicationKernelContext";
import type { LightType } from "@/types/scene";
import ambientLightIcon from "@/assets/images/icons/descriptive/ambientLight.svg";
import spotLightIcon from "@/assets/images/icons/descriptive/spotLight.svg";
import hdriLightIcon from "@/assets/images/icons/descriptive/hdr.svg";
import graphStyles from "../atoms/SceneGraph.module.css";
import styles from "./CameraTypeSelect.module.css";

const OPTIONS: {
  type: LightType;
  icon: string;
  labelKey: "light.type.ambient" | "light.type.spot" | "light.type.hdri";
}[] = [
  { type: "Ambient", icon: ambientLightIcon, labelKey: "light.type.ambient" },
  { type: "Spot", icon: spotLightIcon, labelKey: "light.type.spot" },
  { type: "HDRI", icon: hdriLightIcon, labelKey: "light.type.hdri" },
];

export function LightTypeSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: LightType;
  onChange: (type: LightType) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className={styles.list} role="listbox" aria-label={t("light.type.title")}>
      {OPTIONS.map((option) => {
        const selected = value === option.type;
        const optionClass = [
          styles.option,
          selected ? styles.optionActive : styles.optionIdle,
        ]
          .filter(Boolean)
          .join(" ");
        const iconWrapClass = [
          graphStyles.iconWrap,
          selected ? styles.iconWrapActive : styles.iconWrapIdle,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={option.type}
            type="button"
            role="option"
            aria-selected={selected}
            className={optionClass}
            disabled={disabled}
            onClick={() => onChange(option.type)}
          >
            <span className={iconWrapClass}>
              <img className={graphStyles.icon} src={option.icon} alt="" />
            </span>
            <span className={styles.label}>{t(option.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
