import type { CameraState } from '../types/scene';
import { FigmaHandler } from '../figma/figmaHandler';
import { SceneNamingService } from './sceneNamingService';

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
    camera: CameraState,
  ): void {
    void sceneId;
    void glb;
    void textureFrames;
    void camera;
  }

  restoreLinkedSceneData(frameId: string): object {
    void frameId;
    return {};
  }

  findSceneRenders(sceneId: string): string[] {
    void sceneId;
    return [];
  }

  updateExistingRenders(nodeIDs: string[], png: Uint8Array): void {
    void nodeIDs;
    void png;
  }
}
