import type { HistoryEntry } from '../types/commands';
import { SceneStorage } from '../store/sceneStorage';

export class DeletionGarbageCollector {
  scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  purgeIfEvicted(entry: HistoryEntry | null): void {
    void entry;
  }

  purgeModel(modelId: string): void {
    void modelId;
  }
}
