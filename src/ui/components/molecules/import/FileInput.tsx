import { useRef, type ChangeEvent } from "react";

import type { DeviceImportSource } from "@/types/import";
import { ImportDropzone, type ImportDropzoneState } from "./ImportDropzone";
import { ImportFileIcon } from "./ImportDropzoneIcons";
import { parseDeviceImportFiles } from "./parseDeviceImportFiles";

export function FileInput({
  onSourceReady,
  onParseError,
  dropzoneState = "idle",
  sourceLabel = null,
  error = null,
}: {
  onSourceReady: (source: DeviceImportSource) => void;
  onParseError?: (message: string) => void;
  dropzoneState?: ImportDropzoneState;
  sourceLabel?: string | null;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    try {
      const source = await parseDeviceImportFiles(files);
      onSourceReady(source);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось прочитать файл";
      onParseError?.(message);
    }
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files;
    if (!list?.length) return;
    await handleFiles(list);
    event.target.value = "";
  };

  const state: ImportDropzoneState =
    dropzoneState === "error" || error ? "error" : dropzoneState;

  const title =
    sourceLabel && state !== "idle" && state !== "loading"
      ? sourceLabel
      : "Перетяните сюда файл или кликните для открытия проводника";

  const hint =
    state === "idle"
      ? "или кликните для открытия проводника"
      : state === "selected"
        ? "Для загрузки нового файла перетяните его в эту область или кликните для открытия проводника"
        : undefined;

  return (
    <ImportDropzone
      state={state}
      icon={<ImportFileIcon />}
      title={title}
      error={error}
      onClick={() => inputRef.current?.click()}
      onDropFiles={handleFiles}
    >
      <input
        ref={inputRef}
        className="import-dropzone__file-input"
        type="file"
        multiple
        accept=".obj,.fbx,.glb,.mtl,.png,.jpg,.jpeg,.webp,.tga,.bmp"
        onChange={handleChange}
      />
    </ImportDropzone>
  );
}
