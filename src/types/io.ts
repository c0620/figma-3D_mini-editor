import type { RenderOptions } from "./render";

export type DeviceImportFormat = "OBJ" | "GLTF" | "FBX" | "GLB";
export type DeviceExportFormat = "PNG" | "OBJ" | "GLTF";

export type FigmaImportFormat = "FigmaI";
export type FigmaExportFormat = "PNG" | FigmaImportFormat;

export interface FileOptions {
  appendTextures: boolean;
  onlyVisible: boolean;
  file: boolean;
}

export type ExportOptions = {
  renderOptions: RenderOptions;
  fileOptions: FileOptions;
};

export type ExportResults = {
  png: Blob | undefined;
  gltf: Blob | undefined;
  zip: Blob | undefined;
};
