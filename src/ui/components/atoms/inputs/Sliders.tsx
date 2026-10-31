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

function calculateSliderValue(
  value: InputNumbersField["value"],
  range: InputNumbersField["range"]
): number {
  const number = parseFloat(value);
  if (!range) return number;
  if (range.max < number) return range.max;
  if (range.min > number) return range.min;
  return number;
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
      value={calculateSliderValue(field.value, field.range)}
      step={field.range.step}
      onChange={(event) => {
        const next = +event.target.value;
        if (field.range?.onDrag) field.range.onDrag(next);
        else field.onApply(next);
        field.setValue(event.target.value);
      }}
      onPointerUp={(event) => {
        field.onApply(+event.currentTarget.value);
        field.setValue(event.currentTarget.value);
      }}
    />
  );
}

export function SliderCentered({ field }: { field: InputNumbersField }) {
  if (!field.range) return;
  return (
    <label className={styles.sliderCenteredLabel}>
      <input
        className={styles.sliderCentered}
        style={getCenteredSliderProgressStyle(
          field.range.min,
          field.range.max,
          parseFloat(field.value)
        )}
        type="range"
        min={field.range.min}
        max={field.range.max}
        value={calculateSliderValue(field.value, field.range)}
        step={field.range.step}
        onChange={
          field.range.onDrag
            ? (event) => field.range!.onDrag!(+event.target.value)
            : (event) => field.onApply(+event.target.value)
        }
        onPointerUp={(event) => field.onApply(+event.currentTarget.value)}
      />
    </label>
  );
}
