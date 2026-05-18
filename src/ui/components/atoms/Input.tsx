import type { ChangeEvent } from "react";

import type { InputField } from "../molecules/EditorInput";

export function InputText({ field }: { field: InputField }) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.target.value.replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    field.onChange(parsed);
  };

  return (
    <>
      {field.label ? <label>{field.label}</label> : null}
      <input
        type="number"
        step="any"
        style={field.isActive ? { color: "orange" } : { color: "white" }}
        onChange={handleChange}
        value={Number.isFinite(field.value) ? field.value : 0}
      />
    </>
  );
}

export function InputMultipleText() {}

export function InputColor() {}

export function InputProjectName() {}

export function InputModelSource() {}

export function Toggle() {}

export function SelectIcon() {}

export function SelectColor() {}

export function Slider() {
  return <div>slider</div>;
}

export function SliderCentered() {
  return <div>c slider</div>;
}

export function PreviewIcon() {}

export function PreviewColor() {}

export function FileInput({
  onUpload,
  error = null,
  success = true,
}: {
  onUpload: Function;
  error?: any;
  success?: boolean;
}) {
  console.log(error, success);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
    const fileType = file.name.split(".")[1].toUpperCase();
    onUpload(fileType, file);
  };
  return (
    <label>
      <input type="file" onChange={handleFileChange}></input>
    </label>
  );
}

export function FigmaInput({
  error = null,
  success = true,
}: {
  error?: any;
  success?: boolean;
}) {
  return (
    <div>
      FileInput {error ? error : ""} {success ? "success" : ""}
    </div>
  );
}
