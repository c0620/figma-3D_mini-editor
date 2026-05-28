import type { StandardCameraPresetId } from "@/types/scene";
import cameraPTop from "@/assets/images/icons/descriptive/cameraPTop.svg";
import cameraPBot from "@/assets/images/icons/descriptive/cameraPBot.svg";
import cameraPLeft from "@/assets/images/icons/descriptive/cameraPLeft.svg";
import cameraPRight from "@/assets/images/icons/descriptive/cameraPRight.svg";
import cameraPFront from "@/assets/images/icons/descriptive/cameraPFront.svg";
import cameraPBack from "@/assets/images/icons/descriptive/cameraPBack.svg";
import cameraPUser from "@/assets/images/icons/descriptive/cameraPUser.svg";
import cameraPSave from "@/assets/images/icons/descriptive/cameraPSave.svg";
import compactStyles from "../organisms/PanelCompact.module.css";

export const CAMERA_PRESET_ICONS: Record<StandardCameraPresetId, string> = {
  top: cameraPTop,
  bottom: cameraPBot,
  left: cameraPLeft,
  right: cameraPRight,
  front: cameraPFront,
  back: cameraPBack,
};

export { cameraPUser, cameraPSave };

export function CameraPresetIconButton({
  icon,
  title,
  disabled = false,
  onClick,
}: {
  icon: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={compactStyles.presetIconBtn}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      <img src={icon} alt="" />
    </button>
  );
}

export function CameraPresetIconGrid({
  rows,
  savedView,
  disabled = false,
  onPreset,
  onSaved,
  onSaveCurrent,
  labels,
}: {
  rows: StandardCameraPresetId[][];
  savedView: boolean;
  disabled?: boolean;
  onPreset: (preset: StandardCameraPresetId) => void;
  onSaved?: () => void;
  onSaveCurrent?: () => void;
  labels: {
    preset: (id: StandardCameraPresetId) => string;
    saved: string;
    saveCurrent: string;
  };
}) {
  return (
    <div className={compactStyles.presetIconGrid}>
      {rows.map((row) => (
        <div key={row.join("-")} className={compactStyles.presetIconRow}>
          {row.map((preset) => (
            <CameraPresetIconButton
              key={preset}
              icon={CAMERA_PRESET_ICONS[preset]}
              title={labels.preset(preset)}
              disabled={disabled}
              onClick={() => onPreset(preset)}
            />
          ))}
        </div>
      ))}
      {savedView && onSaved ? (
        <div className={compactStyles.presetIconRow}>
          <CameraPresetIconButton
            icon={cameraPUser}
            title={labels.saved}
            disabled={disabled}
            onClick={onSaved}
          />
        </div>
      ) : null}
      {onSaveCurrent ? (
        <div className={compactStyles.presetIconRow}>
          <CameraPresetIconButton
            icon={cameraPSave}
            title={labels.saveCurrent}
            disabled={disabled}
            onClick={onSaveCurrent}
          />
        </div>
      ) : null}
    </div>
  );
}
