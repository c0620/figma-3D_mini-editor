import { describe, expect, it } from "vitest";

import { CommandType, type HistoryEntry } from "@/types/commands";
import { History } from "@/store/history";

function entry(id: string): HistoryEntry<{ id: string }> {
  return { type: CommandType.TransformObject, snapshot: { id } };
}

describe("History", () => {
  it("pushes undo entries and pops them in reverse order", () => {
    const history = new History();
    history.pushUndoAction(entry("a"));
    history.pushUndoAction(entry("b"));

    expect(history.getUndoAction()?.snapshot).toEqual({ id: "b" });
    expect(history.getUndoAction()?.snapshot).toEqual({ id: "a" });
    expect(history.getUndoAction()).toBeNull();
  });

  it("evicts the oldest undo entry after the max count", () => {
    const history = new History();
    const evicted: Array<string | undefined> = [];

    for (let index = 0; index < 11; index += 1) {
      const evictedEntry = history.pushUndoAction(entry(String(index)));
      evicted.push((evictedEntry?.snapshot as { id: string } | undefined)?.id);
    }

    expect(evicted.filter(Boolean)).toEqual(["0"]);
    expect(history.previous).toHaveLength(10);
    expect(history.previous[0]?.snapshot).toEqual({ id: "1" });
  });

  it("clears the redo stack", () => {
    const history = new History();
    history.future.push(entry("redo"));
    history.clearRedo();
    expect(history.future).toEqual([]);
    expect(history.getRedoAction()).toBeNull();
  });
});
