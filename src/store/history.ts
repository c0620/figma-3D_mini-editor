import type { HistoryEntry } from "../types/commands";

export class History {
  actions: HistoryEntry[] = [];
  redoActions: HistoryEntry[] = [];
  readonly maxCount: number = 10;

  push(entry: HistoryEntry): HistoryEntry | null {
    this.actions.push(entry);
    let evicted: HistoryEntry | null = null;
    if (this.actions.length > this.maxCount) {
      evicted = this.actions.shift() ?? null;
    }
    return evicted;
  }

  popLast(): HistoryEntry | null {
    return this.actions.pop() ?? null;
  }

  popRedo(): HistoryEntry | null {
    return this.redoActions.pop() ?? null;
  }

  clearRedo(): void {
    this.redoActions = [];
  }
}
