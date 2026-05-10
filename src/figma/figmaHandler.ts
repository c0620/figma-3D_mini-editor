import { FigmaAPI } from './figmaApi';

export class FigmaHandler {
  errors: string = '';
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

  getFrameBytes(nodeId: string): Uint8Array | null {
    void nodeId;
    return null;
  }

  createFrame(name: string, width: number, height: number): string {
    this.api.postMessage({ type: 'create-frame', name, width, height });
    return '';
  }

  setPluginData(nodeID: string, key: string, value: string): void {
    this.api.postMessage({ type: 'set-plugin-data', nodeID, key, value });
  }

  getPluginData(nodeID: string, key: string): string | null {
    void nodeID;
    void key;
    return null;
  }

  insertImage(nodeID: string, bytes: Uint8Array): void {
    this.api.postMessage({ type: 'insert-image', nodeID, bytes });
  }
}
