import type { ChangeEvent } from "react";

import type { SceneFileType } from "@/io/sceneTransferFacade";
import type { SceneImportResources } from "@/io/sceneTransferFacade";
import type { InputField } from "../molecules/EditorInput";

const MODEL_EXT: Record<string, SceneFileType> = {
  obj: "OBJ",
  fbx: "FBX",
  glb: "GLB",
};

const TEXTURE_EXT = /\.(png|jpe?g|webp|tga|bmp)$/i;

function fileExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
}

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
  onUpload: (
    type: SceneFileType,
    file: File,
    resources?: SceneImportResources
  ) => void | Promise<void>;
  error?: string | null;
  success?: boolean;
}) {
  void error;
  void success;

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const list = event.target.files;
    if (!list?.length) return;

    const files = Array.from(list);
    const modelFile = files.find((f) => MODEL_EXT[fileExtension(f.name)]);
    if (!modelFile) return;

    const type = MODEL_EXT[fileExtension(modelFile.name)]!;
    const mtlFile = files.find((f) => fileExtension(f.name) === "mtl");

    let resources: SceneImportResources | undefined;
    if (type === "OBJ" && (mtlFile || files.some((f) => TEXTURE_EXT.test(f.name)))) {
      resources = { textureFiles: {} };
      if (mtlFile) resources.mtlText = await mtlFile.text();
      for (const f of files) {
        if (TEXTURE_EXT.test(f.name)) {
          resources.textureFiles![f.name] = await f.arrayBuffer();
        }
      }
    }

    await onUpload(type, modelFile, resources);
  };

  return (
    <label>
      <input type="file" multiple onChange={handleFileChange} />
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
