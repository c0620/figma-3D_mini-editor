import { CommandType, type HistoryEntry } from "../types/commands";
import { SceneToolHandler } from "../handlers/sceneToolHandler";
import { SceneStorage } from "../store/sceneStorage";

export class ActionExecutor {
  scene: SceneStorage;
  handlers: Map<CommandType, SceneToolHandler<object>>;

  constructor(scene: SceneStorage) {
    this.scene = scene;
    this.handlers = new Map();
  }

  run(type: CommandType, payload: object): void {
    const handler = this.handlers.get(type);
    handler?.execute(payload);
  }

  snapshot(type: CommandType, payload: object): HistoryEntry<object> {
    const handler = this.handlers.get(type);
    const snapshot = handler?.getStateBeforeExecute(payload);

    if (!snapshot)
      throw new Error("snapshot(ActionExecutor): no stateBeforeExecute");
    return snapshot;
  }
}
