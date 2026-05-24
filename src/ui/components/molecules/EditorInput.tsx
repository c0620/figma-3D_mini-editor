import { InputText, Slider, SliderCentered } from "../atoms/Input";
import type { PanelMode } from "../organisms/PanelScene";

export type InputField = {
  onChange: (value: number) => void;
  value: number;
  isActive: boolean;
  label?: string;
};

export function ObjectNumberInput({
  mode,
  fields,
  label,
  sliderType,
}: {
  mode: PanelMode;
  fields: Array<InputField>;
  label: string;
  sliderType: "default" | "centered" | null;
}) {
  const inputs = fields.map((field) => <InputText field={field} />);
  const slider = sliderType ? (
    sliderType === "default" ? (
      <Slider />
    ) : (
      <SliderCentered />
    )
  ) : (
    ""
  );
  if (mode == "open") {
    return (
      <div>
        {label} {inputs} {slider}
      </div>
    );
  } else {
    return <div>narrow</div>;
  }
}

export function ObjectColorInput() {
  return <div>Object Color Input</div>;
}

export function ObjectRatioInput() {}

export function MeshMaterialSelect() {}

export function TextureSelect() {}

export function Options() {}

export function ModeSelect() {}
