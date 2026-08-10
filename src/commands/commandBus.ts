import { CommandType } from "../types/commands";
import type { HistoryEntry } from "../types/commands";
import { History } from "../store/history";
import { SceneStorage } from "../store/sceneStorage";
import { ActionExecutor } from "./actionExecutor";
import { DeletionGarbageCollector } from "./deletionGarbageCollector";

export class CommandBus {
  scene: SceneStorage;
  history: History;
  executor: ActionExecutor;
  deletionGc: DeletionGarbageCollector;

  constructor(
    scene: SceneStorage,
    history: History,
    executor: ActionExecutor,
    deletionGc: DeletionGarbageCollector
  ) {
    this.scene = scene;
    this.history = history;
    this.executor = executor;
    this.deletionGc = deletionGc;
  }

  execute(type: CommandType, payload: object): void {
    const snapshot = this.executor.snapshot(type, payload);
    const evicted = this.history.pushUndoAction(snapshot);

    this.executor.run(type, payload);

    this.history.future.forEach((f) => this.deletionGc.purgeIfEvicted(f));
    this.history.clearRedo();

    this.deletionGc.purgeIfEvicted(evicted);
    this.syncHistoryFlags();
  }

  undo(): void {
    const previous = this.history.getUndoAction();
    if (!previous) return;

    const current = this.executor.snapshot(previous.type, previous.snapshot);
    this.history.future.push({
      type: current.type,
      snapshot: current.snapshot,
    });

    this.executor.run(previous.type, previous.snapshot);
    this.syncHistoryFlags();
  }

  redo(): void {
    const entry = this.history.getRedoAction();
    if (!entry) return;

    const current = this.executor.snapshot(entry.type, entry.snapshot);
    this.history.previous.push({
      type: current.type,
      snapshot: current.snapshot,
    });

    this.executor.run(entry.type, entry.snapshot);

    this.syncHistoryFlags();
  }

  private syncHistoryFlags(): void {
    this.scene.setHistoryFlags(
      this.history.previous.length > 0,
      this.history.future.length > 0
    );
  }
}
