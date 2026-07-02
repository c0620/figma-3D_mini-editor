import { useState, type CSSProperties } from "react";
import styles from "./Sliders.module.scss";
import type { InputNumbersField } from "./TextInputs";

function getSliderProgressStyle(field: InputNumbersField): CSSProperties {
  const { min, max } = field.range!;
  const progress = ((+field.value - min) / (max - min)) * 100;
  return { "--slider-progress": `${progress}%` } as CSSProperties;
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
        field.range!.onDrag
          ? field.range!.onDrag!(+event.target.value)
          : field.onChange(+event.target.value);
        field.setValue(event.target.value);
      }}
      onPointerUp={(event) => {
        field.onChange(+event.currentTarget.value);
        field.setValue(event.currentTarget.value);
      }}
    ></input>
  );
}

export function SliderCentered({ field }: { field: InputNumbersField }) {
  if (!field.range) throw new Error("Slider: empty params");
  return (
    <>
      centered
      <input
        className={styles.slider}
        style={getSliderProgressStyle(field)}
        type="range"
        min={field.range.min}
        max={field.range.max}
        value={field.value}
        step={field.range.step}
        onChange={
          field.range.onDrag
            ? (event) => field.range?.onDrag!(+event.target.value)
            : (event) => field.onChange(+event.target.value)
        }
        onPointerUp={(event) => field.onChange(+event.currentTarget.value)}
      ></input>
    </>
  );
}
