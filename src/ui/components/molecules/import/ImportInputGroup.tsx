import type { LinkedSelectionSummary } from "@/figma/figmaMessages";
import type {
  DeviceImportSource,
  ImportPreviewData,
  ImportPreviewStatus,
} from "@/types/import";
import { FileInput } from "./FileInput";
import { FigmaInput } from "./FigmaInput";
import { ImportPreviewPanel } from "./ImportPreviewPanel";
import type { ImportDropzoneState } from "./ImportDropzone";
import "./importInput.css";

function resolveDropzoneState(
  status: ImportPreviewStatus
): ImportDropzoneState {
  switch (status) {
    case "validating":
      return "loading";
    case "ready":
      return "selected";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

type ImportInputGroupProps =
  | {
      mode: "device";
      status: ImportPreviewStatus;
      preview: ImportPreviewData | null;
      error: string | null;
      sourceLabel: string | null;
      onSourceReady: (source: DeviceImportSource) => void;
      onParseError?: (message: string) => void;
    }
  | {
      mode: "figma";
      status: ImportPreviewStatus;
      preview: ImportPreviewData | null;
      error: string | null;
      sourceLabel: string | null;
      selectedFrame: LinkedSelectionSummary | null;
      onClear: () => void;
    };

export function ImportInputGroup(props: ImportInputGroupProps) {
  const dropzoneState = resolveDropzoneState(props.status);
  const showPreview = props.status === "ready" && props.preview;

  return (
    <div className="import-input-group">
      {props.mode === "device" ? (
        <FileInput
          dropzoneState={dropzoneState}
          sourceLabel={props.sourceLabel}
          error={props.error}
          onSourceReady={props.onSourceReady}
          onParseError={props.onParseError}
        />
      ) : (
        <FigmaInput
          selectedFrame={props.selectedFrame}
          dropzoneState={dropzoneState}
          error={props.error}
          onClear={props.onClear}
        />
      )}
      {showPreview ? (
        <ImportPreviewPanel preview={props.preview!} variant={props.mode} />
      ) : null}
    </div>
  );
}
