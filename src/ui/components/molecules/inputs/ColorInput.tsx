import type { Color } from "three";
import { InputColorPicker } from "../../atoms/inputs/Pickers";
import styles from "./ColorInput.module.scss";
import type { Material } from "@/types/scene";

export function ColorInput({
  title,
  onChange,
  onPalette,
  value,
}: {
  title: string;
  onChange: (value: Material["color"]) => void;
  onPalette?: (value: Material["color"]) => void;
  value: Color;
}) {
  return (
    <div className={styles.colorInputContainer}>
      <p className="t3">{title}</p>
      <InputColorPicker
        onChange={onChange}
        value={value}
        onPalette={onPalette}
      />
    </div>
  );
}
