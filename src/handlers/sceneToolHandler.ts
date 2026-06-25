import type { CommandType, HistoryEntry } from "@/types/commands";
import { SceneStorage } from "../store/sceneStorage";

export abstract class SceneToolHandler<
  TPayload extends object,
  TSnapshot extends object = TPayload,
> {
  scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  abstract execute(payload: TPayload): void;
  abstract getStateBeforeExecute(payload: TPayload): HistoryEntry<TSnapshot>;
}
