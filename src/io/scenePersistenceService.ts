import { arrayBufferToBase64 } from "../lib/base64";
import { isFigmaPlugin } from "../figma/figmaApi";
import type { CameraState, Scene } from "../types/scene";
import { FigmaHandler } from "../figma/figmaHandler";
import type {
  LinkedFrameSummary,
  LinkedSelectionSummary,
  RestoredLinkedScene,
} from "../figma/figmaMessages";
import { SceneNamingService } from "./sceneNamingService";

export class ScenePersistenceService {
  figmaHandler: FigmaHandler;
  naming: SceneNamingService;

  constructor(figmaHandler: FigmaHandler, naming: SceneNamingService) {
    this.figmaHandler = figmaHandler;
    this.naming = naming;
  }

  saveLinkedSceneData(
    sceneId: string,
    glb: string,
    textureFrames: string[],
    camera: CameraState
  ): void {
    void sceneId;
    void glb;
    void textureFrames;
    void camera;
  }

  async getLinkedSelection(): Promise<LinkedSelectionSummary | null> {
    if (!isFigmaPlugin()) return null;
    return this.figmaHandler.getLinkedSelection();
  }

  subscribeLinkedSelection(
    listener: (frame: LinkedSelectionSummary | null) => void
  ): () => void {
    if (!isFigmaPlugin()) {
      listener(null);
      return () => {};
    }
    return this.figmaHandler.subscribeLinkedSelection(listener);
  }

  async restoreLinkedSceneData(
    frameId: string
  ): Promise<RestoredLinkedScene> {
    if (!isFigmaPlugin()) {
      throw new Error("Импорт из Figma доступен только внутри плагина Figma");
    }
    return this.figmaHandler.restoreLinkedScene(frameId);
  }

  async findSceneRenders(
    sceneId: string,
    projectName: string
  ): Promise<LinkedFrameSummary[]> {
    if (!isFigmaPlugin()) return [];
    return this.figmaHandler.findLinkedRenderFrames(sceneId, projectName);
  }

  async exportRenderFrame(args: {
    frameName: string;
    width: number;
    height: number;
    pngBytes: Uint8Array;
    scene: Scene;
    projectName: string;
    linkedRender: boolean;
    glb?: ArrayBuffer;
  }): Promise<{ frameId: string }> {
    if (!isFigmaPlugin()) {
      throw new Error("Экспорт в Figma доступен только внутри плагина Figma");
    }

    let linked;
    if (args.linkedRender) {
      if (!args.glb) {
        throw new Error("Не удалось подготовить GLB для связанного рендера");
      }

      linked = {
        sceneId: args.scene.id,
        projectName: args.projectName,
        glbBase64: arrayBufferToBase64(args.glb),
        camera: args.scene.camera,
      };
    }

    const frameId = await this.figmaHandler.createRenderFrame({
      name: args.frameName,
      width: args.width,
      height: args.height,
      pngBytes: args.pngBytes,
      linked,
    });

    return { frameId };
  }

  updateExistingRenders(nodeIDs: string[], png: Uint8Array): void {
    void nodeIDs;
    void png;
  }
}
