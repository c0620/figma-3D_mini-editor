import { CommandType } from "../types/commands";
import type { HistoryEntry } from "../types/commands";
import { History } from "../store/history";
import { useSessionStore } from "../store/sessionStore";
import { ActionExecutor } from "./actionExecutor";
import { ActionReverter } from "./actionReverter";
import { DeletionGarbageCollector } from "./deletionGarbageCollector";
import { HistoryInverseBuilder } from "./historyInverseBuilder";

export class CommandBus {
  history: History;
  executor: ActionExecutor;
  reverter: ActionReverter;
  deletionGc: DeletionGarbageCollector;
  inverseBuilder: HistoryInverseBuilder;

  constructor(
    history: History,
    executor: ActionExecutor,
    reverter: ActionReverter,
    deletionGc: DeletionGarbageCollector,
    inverseBuilder: HistoryInverseBuilder
  ) {
    this.history = history;
    this.executor = executor;
    this.reverter = reverter;
    this.deletionGc = deletionGc;
    this.inverseBuilder = inverseBuilder;
  }

  execute(
    type: CommandType,
    payload: object,
    options?: { inversePayload?: object }
  ): void {
    const inversePayload =
      options?.inversePayload ?? this.inverseBuilder.build(type, payload);
    this.executor.run(type, payload);
    const entry: HistoryEntry = { type, payload, inversePayload };
    const evicted = this.history.push(entry);
    this.history.clearRedo();
    this.deletionGc.purgeIfEvicted(evicted);
    this.syncHistoryFlags();
  }

  undo(): void {
    const entry = this.history.popLast();
    if (!entry) return;
    this.history.redoActions.push(entry);
    this.reverter.revert(entry.type, entry.inversePayload);
    this.syncHistoryFlags();
  }

  redo(): void {
    const entry = this.history.popRedo();
    if (!entry) return;
    this.executor.run(entry.type, entry.payload);
    this.history.actions.push(entry);
    this.syncHistoryFlags();
  }

  private syncHistoryFlags(): void {
    useSessionStore
      .getState()
      .setHistoryFlags(
        this.history.actions.length > 0,
        this.history.redoActions.length > 0
      );
  }
}
