import type { SceneStorage } from "@/store/sceneStorage";
import type { SceneEncoder } from "./sceneEncoder";
import type { FigmaHandler } from "@/figma/figmaHandler";
import { PluginDataKeys } from "../../plugin-src/types";

export class FigmaImportExportService {
  encoder: SceneEncoder;
  scene: SceneStorage;
  figma: FigmaHandler;

  constructor(encoder: SceneEncoder, scene: SceneStorage, figma: FigmaHandler) {
    this.encoder = encoder;
    this.scene = scene;
    this.figma = figma;
  }
  // async importLinkedRender(frameID: string) {}

  async exportPlainRender(
    blob: Blob,
    size: [number, number],
    frameID?: FrameNode["id"]
  ): Promise<FrameNode["id"]> {
    const activeCamera = this.scene.getActiveCamera();
    const cameraData = await new Blob([JSON.stringify(activeCamera)]).text();

    const answer = await this.figma.placeRender({
      frameID: frameID,
      nodeData: {
        [PluginDataKeys.sceneID]: this.scene.getProjectName(),
        [PluginDataKeys.camera]: cameraData,
        [PluginDataKeys.scene]: "",
        [PluginDataKeys.textureSectionID]: "",
      },
      size: {
        width: size[0],
        height: size[1],
      },
      imageBytes: await blob.bytes(),
      name: "",
    });
    return answer.frameID;
  }

  // async exportLinkedRender(
  //   blobPNG: Blob,
  //   blobScene: Blob,
  //   blobTextures: Blob[],
  //   camera: SceneCamera
  // ) {}

  // async updateLinkedRender(frames: FigmaFrame[]) {}
}
