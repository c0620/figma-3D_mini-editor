import type { Color } from "three";
import { InputColorPicker } from "../../atoms/inputs/Pickers";
import styles from "./Common.module.scss";
import type { Material } from "@/types/scene";

export function PickerColor({
  title,
  onChange,
  onPalette,
  value,
  isOpen,
}: {
  title: string;
  onChange: (value: Material["color"]) => void;
  onPalette?: (value: Material["color"]) => void;
  value: Color;
  isOpen: boolean;
}) {
  return (
    <div className={styles.commonContainer}>
      {isOpen && <p className="t3">{title}</p>}
      <InputColorPicker
        onChange={onChange}
        value={value}
        onPalette={onPalette}
        isDetailed={isOpen}
      />
    </div>
  );
}
