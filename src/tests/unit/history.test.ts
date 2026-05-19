import { describe, it, expect } from "vitest";

import { History } from "@/store/history";
import { CommandType } from "@/types/commands";
import type { HistoryEntry } from "@/types/commands";

function entry(type: CommandType, payload: object = {}): HistoryEntry {
  return { type, payload };
}

describe("History", () => {
  it("кладёт запись в конец actions", () => {
    const history = new History();
    history.push(entry(CommandType.SelectObject, { id: "a" }));

    expect(history.actions).toHaveLength(1);
    expect(history.actions[0].payload).toEqual({ id: "a" });
  });

  it("вытесняет старую запись при превышении maxCount", () => {
    const history = new History();
    for (let i = 0; i < 10; i++)
      history.push(entry(CommandType.SelectObject, { i }));

    const evicted = history.push(entry(CommandType.DeleteModel, { id: "x" }));

    expect(history.actions).toHaveLength(100);
    expect(evicted?.payload).toEqual({ i: 0 });
    expect(history.actions.at(-1)?.type).toBe(CommandType.DeleteModel);
  });

  it("clearRedo очищает историю повторов", () => {
    const history = new History();
    history.redoActions.push(entry(CommandType.SelectObject));
    history.clearRedo();

    expect(history.redoActions).toEqual([]);
  });
});
