export interface RenderOptions {
  transparentBackground: boolean;
  width: number;
  height: number;
  render: boolean;
}

export interface RenderResult {
  png: Blob;
  durationMs: number;
}

export interface SceneProperties {
  polygonCount: number;
  sizeBytes: number;
  hasTextures: boolean;
}
