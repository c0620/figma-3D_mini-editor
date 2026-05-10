import { SceneStorage } from '../store/sceneStorage';

export abstract class SceneToolHandler {
  scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  abstract execute(payload: object): void;
}
