export interface DeviceExportOptions {
  exportImage: boolean;
  exportScene: boolean;
  transparentBackground: boolean;
  includeTextures: boolean;
  includeCamera: boolean;
  width: number;
  height: number;
}

export interface FigmaExportOptions {
  transparentBackground: boolean;
  width: number;
  height: number;
  linkedRender: boolean;
}

export interface SceneExportOptions {
  includeTextures: boolean;
  includeCamera: boolean;
}
