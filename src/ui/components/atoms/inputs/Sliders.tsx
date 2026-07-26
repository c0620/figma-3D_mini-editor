import type { CSSProperties } from "react";
import styles from "./Sliders.module.scss";
import type { InputNumbersField } from "./TextInputs";

function getSliderProgressStyle(field: InputNumbersField): CSSProperties {
  const { min, max } = field.range!;
  const progress = ((+field.value - min) / (max - min)) * 100;
  return { "--slider-progress": `${progress}%` } as CSSProperties;
}

function getCenteredSliderProgressStyle(
  min: number,
  max: number,
  value: number
) {
  const center = (min + max) / 2;
  const progress = 50 + ((value - center) / (max - min)) * 100;
  return {
    "--slider-progress-start": `${Math.min(50, progress)}%`,
    "--slider-progress-end": `${Math.max(50, progress)}%`,
  } as CSSProperties;
}

export function Slider({ field }: { field: InputNumbersField }) {
  if (!field.range) throw new Error("Slider: empty params");
  return (
    <input
      className={styles.slider}
      style={getSliderProgressStyle(field)}
      type="range"
      min={field.range.min}
      max={field.range.max}
      value={field.value}
      step={field.range.step}
      onChange={(event) => {
        const next = +event.target.value;
        if (field.range?.onDrag) field.range.onDrag(next);
        else field.onChange(next);
        field.setValue(event.target.value);
      }}
      onPointerUp={(event) => {
        field.onChange(+event.currentTarget.value);
        field.setValue(event.currentTarget.value);
      }}
    />
  );
}

export function SliderCentered({
  max,
  min,
  value,
  step,
  onDrag,
  onChange,
}: {
  max: number;
  min: number;
  value: number;
  step: number;
  onDrag?: (value: number) => void;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.sliderCenteredLabel}>
      <input
        className={styles.sliderCentered}
        style={getCenteredSliderProgressStyle(min, max, value)}
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={
          onDrag
            ? (event) => onDrag!(+event.target.value)
            : (event) => onChange(+event.target.value)
        }
        onPointerUp={(event) => onChange(+event.currentTarget.value)}
      />
    </label>
  );
}
