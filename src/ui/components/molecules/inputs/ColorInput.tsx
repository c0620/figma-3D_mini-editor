import type { Color } from "three";
import { InputColorPicker } from "../../atoms/inputs/Pickers";
import styles from "./ColorInput.module.scss";

export function ColorInput({
  title,
  onChange,
  onPalette,
  value,
}: {
  title: string;
  onChange: (value: Color) => void;
  onPalette?: (value: Color) => void;
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
