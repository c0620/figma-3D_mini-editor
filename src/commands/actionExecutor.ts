import { CommandType } from '../types/commands';
import { SceneToolHandler } from '../handlers/sceneToolHandler';
import { SceneStorage } from '../store/sceneStorage';

export class ActionExecutor {
  scene: SceneStorage;
  handlers: Map<CommandType, SceneToolHandler>;

  constructor(scene: SceneStorage) {
    this.scene = scene;
    this.handlers = new Map();
  }

  run(type: CommandType, payload: object): void {
    const handler = this.handlers.get(type);
    handler?.execute(payload);
  }
}
