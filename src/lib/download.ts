export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function sanitizeExportBasename(name: string, fallback: string): string {
  const trimmed = name.trim();
  const base = trimmed.length > 0 ? trimmed : fallback;
  return base.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").slice(0, 200);
}
