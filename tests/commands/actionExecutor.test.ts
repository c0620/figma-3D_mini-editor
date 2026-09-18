import { beforeEach, describe, expect, it } from "vitest";

import { ActionExecutor } from "@/commands/actionExecutor";
import { SceneToolHandler } from "@/handlers/sceneToolHandler";
import { SceneStorage } from "@/store/sceneStorage";
import { CommandType, type HistoryEntry } from "@/types/commands";

import { resetStores } from "../helpers/resetStores";

class FakeHandler extends SceneToolHandler<{ value: number }> {
  calls: Array<{ value: number }> = [];

  execute(payload: { value: number }): void {
    this.calls.push(payload);
  }

  getStateBeforeExecute(
    payload: { value: number }
  ): HistoryEntry<{ value: number }> {
    return {
      type: CommandType.TransformObject,
      snapshot: { value: payload.value - 1 },
    };
  }
}

describe("ActionExecutor", () => {
  beforeEach(() => {
    resetStores();
  });

  it("runs a registered handler", () => {
    const storage = new SceneStorage();
    const executor = new ActionExecutor(storage);
    const handler = new FakeHandler(storage);
    executor.handlers.set(CommandType.TransformObject, handler);

    executor.run(CommandType.TransformObject, { value: 4 });
    expect(handler.calls).toEqual([{ value: 4 }]);
  });

  it("returns a snapshot from the handler", () => {
    const storage = new SceneStorage();
    const executor = new ActionExecutor(storage);
    executor.handlers.set(
      CommandType.TransformObject,
      new FakeHandler(storage)
    );

    expect(executor.snapshot(CommandType.TransformObject, { value: 4 })).toEqual(
      {
        type: CommandType.TransformObject,
        snapshot: { value: 3 },
      }
    );
  });

  it("throws when a snapshot is requested for an unknown command", () => {
    const executor = new ActionExecutor(new SceneStorage());
    expect(() =>
      executor.snapshot(CommandType.RenameScene, {})
    ).toThrow(/no stateBeforeExecute/);
  });
});
