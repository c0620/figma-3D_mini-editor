import type { HistoryEntry } from "../types/commands";

export class History {
  previous: HistoryEntry[] = [];
  current: HistoryEntry[] = [];
  readonly maxCount: number = 10;

  pushPreviousAction(entry: HistoryEntry): HistoryEntry | null {
    this.previous.push(entry);
    let evicted: HistoryEntry | null = null;
    if (this.previous.length > this.maxCount) {
      evicted = this.previous.shift() ?? null;
    }
    return evicted;
  }

  getPreviousAction(): HistoryEntry | null {
    return this.previous.pop() ?? null;
  }

  getRedoAction(): HistoryEntry | null {
    return this.current.pop() ?? null;
  }

  clearRedo(): void {
    this.current = [];
  }
}
