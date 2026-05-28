import type {
  ExportRenderFrameResponse,
  FindLinkedFramesResponse,
  FigmaColorVariableSummary,
  GetLinkedSelectionResponse,
  LinkedRenderPayload,
  LinkedSelectionSummary,
  LinkedSelectionUpdateMessage,
  ListColorVariablesResponse,
  ResolveColorVariableResponse,
  RestoredLinkedScene,
  VariablesChangedMessage,
} from "./figmaMessages";
import { FigmaAPI } from "./figmaApi";

export interface CreateRenderFrameParams {
  name: string;
  width: number;
  height: number;
  pngBytes: Uint8Array;
  linked?: LinkedRenderPayload;
}

export class FigmaHandler {
  errors: string = "";
  private api: FigmaAPI;

  constructor(api: FigmaAPI) {
    this.api = api;
  }

  subscribeSelection(listener: (frames: string[]) => void): void {
    this.subscribeLinkedSelection((frame) => {
      listener(frame ? [frame.frameId] : []);
    });
  }

  subscribeLinkedSelection(
    listener: (frame: LinkedSelectionSummary | null) => void
  ): () => void {
    const handler = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as
        | LinkedSelectionUpdateMessage
        | undefined;
      if (msg?.type === "linked-selection-update") {
        listener(msg.frame ?? null);
      }
    };

    window.addEventListener("message", handler);

    void this.getLinkedSelection()
      .then(listener)
      .catch(() => listener(null));

    return () => window.removeEventListener("message", handler);
  }

  getSelectedFrames(): string[] {
    return [];
  }

  getActivePageNodes(): string[] {
    return [];
  }

  getFrameBytes(nodeId: string): Uint8Array | null {
    void nodeId;
    return null;
  }

  async createRenderFrame(params: CreateRenderFrameParams): Promise<string> {
    const response = await this.api.request<ExportRenderFrameResponse>({
      type: "export-render-frame",
      name: params.name,
      width: params.width,
      height: params.height,
      pngBytes: Array.from(params.pngBytes),
      linked: params.linked,
    });

    return response.frameId;
  }

  async findLinkedRenderFrames(
    sceneId: string,
    projectName: string
  ): Promise<FindLinkedFramesResponse["frames"]> {
    const response = await this.api.request<FindLinkedFramesResponse>({
      type: "find-linked-frames",
      sceneId,
      projectName,
    });

    return response.frames;
  }

  async getLinkedSelection(): Promise<LinkedSelectionSummary | null> {
    const response = await this.api.request<GetLinkedSelectionResponse>({
      type: "get-linked-selection",
    });

    return response.frame;
  }

  async restoreLinkedScene(frameId: string): Promise<RestoredLinkedScene> {
    return this.api.request<RestoredLinkedScene>({
      type: "restore-linked-scene",
      frameId,
    });
  }

  async listColorVariables(): Promise<FigmaColorVariableSummary[]> {
    const response = await this.api.request<ListColorVariablesResponse>({
      type: "list-color-variables",
    });
    return response.variables;
  }

  async resolveColorVariable(variableId: string): Promise<string> {
    const response = await this.api.request<ResolveColorVariableResponse>({
      type: "resolve-color-variable",
      variableId,
    });
    return response.hex;
  }

  subscribeVariableChanges(listener: () => void): () => void {
    const handler = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as VariablesChangedMessage | undefined;
      if (msg?.type === "variables-changed") {
        listener();
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }
}
