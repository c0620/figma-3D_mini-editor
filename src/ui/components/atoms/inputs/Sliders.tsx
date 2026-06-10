import styles from "./Sliders.module.scss";
import type { InputField } from "./TextInputs";

export function Slider({ field }: { field: InputField }) {
  if (!field.range) throw new Error("Slider: empty params");
  return (
    <input
      className={styles.slider}
      type="range"
      min={field.range.min}
      max={field.range.max}
      value={field.value}
      step={field.range.step}
      onChange={(event) => field.onChange(+event.target.value)}
    ></input>
  );
}

export function SliderCentered({ field }: { field: InputField }) {
  if (!field.range) throw new Error("Slider: empty params");
  return (
    <>
      centered
      <input
        className={styles.slider}
        type="range"
        min={field.range.min}
        max={field.range.max}
        value={field.value}
        step={field.range.step}
        onChange={(event) => field.onChange(+event.target.value)}
      ></input>
    </>
  );
}
