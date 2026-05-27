const DEFAULT_EXPORT_WIDTH = 1920;

export function heightFromWidth(width: number, aspect: number): number {
  return Math.max(1, Math.round(width / aspect));
}

export function widthFromHeight(height: number, aspect: number): number {
  return Math.max(1, Math.round(height * aspect));
}

export function defaultExportResolution(aspect: number): {
  width: number;
  height: number;
} {
  const width = DEFAULT_EXPORT_WIDTH;
  return { width, height: heightFromWidth(width, aspect) };
}
