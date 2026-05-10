import { CommandType } from '../types/commands';
import { SceneStorage } from '../store/sceneStorage';

export class ActionReverter {
  scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  revert(type: CommandType, payload: object): void {
    void type;
    void payload;
  }
}
