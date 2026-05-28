import type { LinkedSelectionSummary } from "@/figma/figmaMessages";
import { ImportDropzone, type ImportDropzoneState } from "./ImportDropzone";
import { ImportFrameIcon } from "./ImportDropzoneIcons";

export function FigmaInput({
  selectedFrame = null,
  dropzoneState = "idle",
  error = null,
  onClear,
}: {
  selectedFrame?: LinkedSelectionSummary | null;
  dropzoneState?: ImportDropzoneState;
  error?: string | null;
  onClear?: () => void;
}) {
  const state: ImportDropzoneState =
    dropzoneState === "error" || error ? "error" : dropzoneState;

  const title =
    selectedFrame && state !== "idle" && state !== "loading"
      ? selectedFrame.frameName
      : "Выделите фрейм-связанный рендер в Figma";

  return (
    <ImportDropzone
      state={state}
      icon={<ImportFrameIcon />}
      title={title}
      error={error}
      onClick={selectedFrame && state === "selected" ? onClear : undefined}
    />
  );
}
