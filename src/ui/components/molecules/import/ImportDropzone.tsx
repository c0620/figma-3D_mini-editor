import type { DragEvent, ReactNode } from "react";

export type ImportDropzoneState = "idle" | "selected" | "loading" | "error";

export function ImportDropzone({
  state,
  icon,
  title,
  hint,
  error,
  onClick,
  onDropFiles,
  children,
}: {
  state: ImportDropzoneState;
  icon: ReactNode;
  title: string;
  hint?: string;
  error?: string | null;
  onClick?: () => void;
  onDropFiles?: (files: FileList) => void;
  children?: ReactNode;
}) {
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      state === "loading" ||
      !onDropFiles ||
      !event.dataTransfer.files.length
    ) {
      return;
    }
    onDropFiles(event.dataTransfer.files);
  };

  const className = [
    "import-dropzone",
    state === "selected" ? "import-dropzone_selected" : "",
    state === "loading" ? "import-dropzone_loading" : "",
    state === "error" ? "import-dropzone_error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      onClick={state === "loading" ? undefined : onClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      <div className="import-dropzone__icon">{icon}</div>
      <div className="import-dropzone__title">{title}</div>
      {state === "loading" ? (
        <div className="import-dropzone__hint"></div>
      ) : state === "error" && error ? (
        <div className="import-dropzone__error">{error}</div>
      ) : hint ? (
        <div className="import-dropzone__hint">{hint}</div>
      ) : null}
      {children}
    </div>
  );
}
