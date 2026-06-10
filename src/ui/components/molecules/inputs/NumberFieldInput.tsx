import { Slider, SliderCentered } from "../../atoms/inputs/Sliders";
import { InputText, type InputField } from "../../atoms/inputs/TextInputs";

export function NumberFieldInput({
  title,
  field,
}: {
  title?: string;
  field: InputField;
}) {
  return (
    <div>
      <p>{title}</p>
      <div>
        <InputText field={field} />
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
