import type { CameraState } from "../types/scene";

export const FIGMA_PLUGIN_DATA_KEY = "figma3d.meta";

export interface LinkedRenderPayload {
  sceneId: string;
  projectName: string;
  glbBase64: string;
  camera: CameraState;
}

export interface ExportRenderFrameRequest {
  type: "export-render-frame";
  requestId: string;
  name: string;
  width: number;
  height: number;
  pngBytes: number[];
  linked?: LinkedRenderPayload;
}

export interface FindLinkedFramesRequest {
  type: "find-linked-frames";
  requestId: string;
  sceneId: string;
  projectName: string;
}

export interface LinkedFrameSummary {
  id: string;
  name: string;
}

export interface FigmaPluginResponse<T = unknown> {
  type: "figma-response";
  requestId: string;
  ok: boolean;
  payload?: T;
  error?: string;
}

export interface ExportRenderFrameResponse {
  frameId: string;
}

export interface FindLinkedFramesResponse {
  frames: LinkedFrameSummary[];
}

export interface LinkedSelectionSummary {
  frameId: string;
  frameName: string;
  sceneId: string;
  projectName: string;
}

export interface RestoredLinkedScene {
  sceneId: string;
  projectName: string;
  camera: CameraState;
  glbBase64: string;
  frameName: string;
}

export interface GetLinkedSelectionResponse {
  frame: LinkedSelectionSummary | null;
}

export interface LinkedSelectionUpdateMessage {
  type: "linked-selection-update";
  frame: LinkedSelectionSummary | null;
}
