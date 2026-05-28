import { useI18n } from "@/app/ApplicationKernelContext";
import type { CameraState } from "@/types/scene";
import cameraPIcon from "@/assets/images/icons/descriptive/cameraP.svg";
import cameraOIcon from "@/assets/images/icons/descriptive/cameraO.svg";
import graphStyles from "../atoms/SceneGraph.module.css";
import styles from "./CameraTypeSelect.module.css";

type CameraType = CameraState["type"];

const OPTIONS: {
  type: CameraType;
  icon: string;
  labelKey: "camera.type.perspective" | "camera.type.orthographic";
}[] = [
  { type: "Perspective", icon: cameraPIcon, labelKey: "camera.type.perspective" },
  {
    type: "Orthographic",
    icon: cameraOIcon,
    labelKey: "camera.type.orthographic",
  },
];

export function CameraTypeSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: CameraType;
  onChange: (type: CameraType) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className={styles.list} role="listbox" aria-label={t("camera.type.title")}>
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
