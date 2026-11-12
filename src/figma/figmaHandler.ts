import {
  FigmaAPITypes,
  type FigmaAPIParams,
  type UIParams,
  type UIRequests,
} from "../../plugin-src/types";
import { FigmaAPI } from "./figmaApi";
import { randomUUID } from "@/lib/randomId";

type FigmaContract = {
  [K in FigmaAPITypes]: (request: UIParams[K]) => Promise<FigmaAPIParams[K]>;
};

export class FigmaHandler implements FigmaContract {
  errors: string = "";
  private api: FigmaAPI;

  constructor(api: FigmaAPI) {
    this.api = api;
  }

  subscribeSelection(listener: (frames: string[]) => void): void {
    void listener;
  }

  getSelectedFrames(): string[] {
    return [];
  }

  getActivePageNodes(): string[] {
    return [];
  }

  placeRender(params: UIParams[FigmaAPITypes.placeRender]) {
    return this.api.postMessage({
      id: randomUUID(),
      type: FigmaAPITypes.placeRender,
      ...params,
    });
  }

  findPluginFrames(params: UIParams[FigmaAPITypes.findPluginFrames]) {
    return this.api.postMessage({
      id: randomUUID(),
      type: FigmaAPITypes.findPluginFrames,
      ...params,
    });
  }

  createFrame(params: UIParams[FigmaAPITypes.createFrame]) {
    return this.api.postMessage({
      id: randomUUID(),
      type: FigmaAPITypes.createFrame,
      ...params,
    });
  }

  setPluginData(params: UIParams[FigmaAPITypes.setPluginData]) {
    return this.api.postMessage({
      id: randomUUID(),
      type: FigmaAPITypes.setPluginData,
      ...params,
    });
  }

  getPluginData(params: UIParams[FigmaAPITypes.getPluginData]) {
    return this.api.postMessage({
      id: randomUUID(),
      type: FigmaAPITypes.getPluginData,
      ...params,
    });
  }

  insertImage(params: UIParams[FigmaAPITypes.insertImage]) {
    return this.api.postMessage({
      id: randomUUID(),
      type: FigmaAPITypes.insertImage,
      ...params,
    });
  }

  closePlugin() {
    return this.api.postMessage({
      id: randomUUID(),
      type: FigmaAPITypes.closePlugin,
    });
  }
}
