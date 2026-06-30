import { Slider, SliderCentered } from "../../atoms/inputs/Sliders";
import { InputNumbers, type InputField } from "../../atoms/inputs/TextInputs";
import styles from "./NumberFieldInput.module.scss";

export function NumberFieldInput({
  title,
  field,
}: {
  title?: string;
  field: InputField;
}) {
  return (
    <div className={styles.numberInputContainer}>
      <p className="t3">{title}</p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--margin-s)",
        }}
      >
        <InputNumbers field={field} />
        {field.range &&
          (field.range.variant == "default" ? (
            <Slider field={field} />
          ) : (
            <SliderCentered field={field} />
          ))}
      </div>
    </div>
  );
}
