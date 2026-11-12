import type { RenderOptions } from "./render";
import type { SceneCamera } from "./scene";

export enum ImportTypes {
  device = "deviceI",
  figma = "figmaI",
  library = "libraryI",
}

export enum ExportTypes {
  device = "deviceE",
  figma = "figmaE",
}

export type DeviceImportFormat = "OBJ" | "FBX" | "GLB";
export type DeviceExportFormat = "PNG" | "OBJ" | "GLTF";

export type FigmaLinkedImportFormat = "FigmaLinked";
export type FigmaExportFormat = "PNG" | FigmaLinkedImportFormat;

export interface FileOptions {
  appendTextures: boolean;
  onlyVisible: boolean;
  file: boolean;
}

export interface FigmaOptions {
  linkedRender: boolean;
  updateFrames: boolean;
  framesToUpdate: string[];
}

export type ExportOptions = {
  renderOptions: RenderOptions;
  fileOptions: FileOptions;
  figmaOptions: FigmaOptions;
};

export type DeviceExportResults = {
  png: Blob | undefined;
  gltf: Blob | undefined;
  zip: Blob | undefined;
};

export type FigmaExportResults = {
  success: boolean;
};

export type UploadAction = "LoadScene" | "AddScene";

export type ImportSceneRequest =
  | {
      source: ImportTypes.device;
      type: DeviceImportFormat;
      input: ArrayBuffer | File | string;
      intent: UploadAction;
    }
  | {
      source: ImportTypes.figma;
      frameId: string;
      intent: UploadAction;
    }
  | {
      source: ImportTypes.library;
      assetId: string;
    };

export type ExportSceneResults = {
  [ExportTypes.device]: DeviceExportResults;
  [ExportTypes.figma]: FigmaExportResults;
};

export type ExportSceneRequests = {
  [K in keyof ExportSceneResults]: {
    to: K;
    format: ExportOptions;
  };
};

export type FigmaFrame = { id: string; camera: SceneCamera };
