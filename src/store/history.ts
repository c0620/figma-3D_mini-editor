import type { HistoryEntry } from "../types/commands";

export class History {
  previous: HistoryEntry<object>[] = [];
  future: HistoryEntry<object>[] = [];
  readonly maxCount: number = 10;

  pushUndoAction(entry: HistoryEntry<object>): HistoryEntry<object> | null {
    this.previous.push(entry);
    let evicted: HistoryEntry<object> | null = null;
    if (this.previous.length > this.maxCount) {
      evicted = this.previous.shift() ?? null;
    }
    return evicted;
  }

  getUndoAction(): HistoryEntry<object> | null {
    return this.previous.pop() ?? null;
  }

  getRedoAction(): HistoryEntry<object> | null {
    return this.future.pop() ?? null;
  }

  clearRedo(): void {
    this.future = [];
  }
}
