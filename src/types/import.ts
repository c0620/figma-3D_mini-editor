import type { LinkedSelectionSummary, RestoredLinkedScene } from "@/figma/figmaMessages";
import type { SceneFileType } from "@/io/sceneTransferFacade";
import type { SceneImportResources } from "@/io/sceneImportExportService";
import type { Scene } from "./scene";

export type ImportPreviewStatus = "idle" | "validating" | "ready" | "error";

export interface ImportFrameMeta {
  frameId: string;
  frameName: string;
  projectName: string;
  sceneId: string;
}

export interface ImportSceneMeta {
  polygonCount: number;
  meshCount: number;
  textureCount: number;
  dimensions: string;
  fileSizeBytes?: number;
  statusMessage: string;
}

export interface ImportTexturePreview {
  id: string;
  name: string;
  url: string;
}

export interface ImportPreviewData {
  previewUrl: string;
  sourceLabel: string;
  frameMeta?: ImportFrameMeta;
  sceneMeta: ImportSceneMeta;
  textures?: ImportTexturePreview[];
}

export interface DeviceImportSource {
  type: SceneFileType;
  file: File;
  resources?: SceneImportResources;
}

export type PreparedDeviceImport = {
  kind: "device";
  type: SceneFileType;
  fileName: string;
  fileSizeBytes: number;
  scene: Scene;
};

export type PreparedFigmaImport = {
  kind: "figma";
  frame: LinkedSelectionSummary;
  restored: RestoredLinkedScene;
  scene: Scene;
};

export type PreparedImport = PreparedDeviceImport | PreparedFigmaImport;
