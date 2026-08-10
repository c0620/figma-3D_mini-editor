import { CommandType, type HistoryEntry } from "../types/commands";
import { SceneStorage } from "../store/sceneStorage";
import type { DeletionHandlerSnapshot } from "@/handlers/deletionHandler";

export class DeletionGarbageCollector {
  scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  purgeIfEvicted(entry: HistoryEntry<object> | null): void {
    if (!entry) return;
    if (entry.type == CommandType.DeleteObject) {
      const { id, kind, isDelete } = entry.snapshot as DeletionHandlerSnapshot;
      const objectToDelete = this.scene.findObjectById(id);
      if (objectToDelete && objectToDelete.pendingDelete && !isDelete) {
        this.scene.deleteObject({ id, kind });
      }
    }
  }
}
