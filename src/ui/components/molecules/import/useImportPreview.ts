import { useCallback, useState } from "react";

import type { SceneTransferFacade } from "@/io/sceneTransferFacade";
import type { LinkedSelectionSummary } from "@/figma/figmaMessages";
import type {
  DeviceImportSource,
  ImportPreviewData,
  ImportPreviewStatus,
} from "@/types/import";

export function useImportPreview(transfer: SceneTransferFacade) {
  const [status, setStatus] = useState<ImportPreviewStatus>("idle");
  const [preview, setPreview] = useState<ImportPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);

  const reset = useCallback(() => {
    transfer.clearPreparedImport();
    setStatus("idle");
    setPreview(null);
    setError(null);
    setSourceLabel(null);
  }, [transfer]);

  const prepareFromDevice = useCallback(
    async (source: DeviceImportSource) => {
      setStatus("validating");
      setError(null);
      setPreview(null);
      setSourceLabel(source.file.name);

      try {
        const data = await transfer.prepareDeviceImportPreview(
          source.type,
          source.file,
          source.resources,
          source.file.name
        );
        setPreview(data);
        setStatus("ready");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Не удалось подготовить preview";
        setError(message);
        setStatus("error");
      }
    },
    [transfer]
  );

  const prepareFromFigma = useCallback(
    async (frame: LinkedSelectionSummary) => {
      setStatus("validating");
      setError(null);
      setPreview(null);
      setSourceLabel(frame.frameName);

      try {
        const data = await transfer.prepareFigmaImportPreview(frame);
        setPreview(data);
        setStatus("ready");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Не удалось подготовить preview";
        setError(message);
        setStatus("error");
      }
    },
    [transfer]
  );

  const commitImport = useCallback(async () => {
    await transfer.commitPreparedImport();
    reset();
  }, [transfer, reset]);

  const reportError = useCallback((message: string) => {
    transfer.clearPreparedImport();
    setError(message);
    setStatus("error");
    setPreview(null);
  }, [transfer]);

  return {
    status,
    preview,
    error,
    sourceLabel,
    prepareFromDevice,
    prepareFromFigma,
    reset,
    commitImport,
    reportError,
  };
}
