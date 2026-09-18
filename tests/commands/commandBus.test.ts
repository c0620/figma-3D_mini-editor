import { beforeEach, describe, expect, it } from "vitest";

import { ActionExecutor } from "@/commands/actionExecutor";
import { CommandBus } from "@/commands/commandBus";
import { DeletionGarbageCollector } from "@/commands/deletionGarbageCollector";
import { DeletionHandler } from "@/handlers/deletionHandler";
import { ObjectAdditionHandler } from "@/handlers/objectAdditionHandler";
import { TransformObjectHandler } from "@/handlers/transformObjectHandler";
import { History } from "@/store/history";
import { SceneStorage } from "@/store/sceneStorage";
import { useSessionStore } from "@/store/sessionStore";
import { CommandType } from "@/types/commands";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

function createRuntime() {
  const scene = new SceneStorage();
  const history = new History();
  const executor = new ActionExecutor(scene);
  const gc = new DeletionGarbageCollector(scene);
  const bus = new CommandBus(scene, history, executor, gc);

  executor.handlers.set(
    CommandType.TransformObject,
    new TransformObjectHandler(scene)
  );
  executor.handlers.set(CommandType.AddObject, new ObjectAdditionHandler(scene));
  executor.handlers.set(CommandType.DeleteObject, new DeletionHandler(scene));

  scene.load(loadBasicScene());
  return { scene, history, bus };
}

describe("CommandBus", () => {
  beforeEach(() => {
    resetStores();
  });

  it("records undo, restores on undo, and reapplies on redo", () => {
    const { scene, bus } = createRuntime();

    bus.execute(CommandType.TransformObject, {
      objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
      position: [4, 0, 0],
    });
    expect(scene.findObjectById(TEST_IDS.mesh)?.transform.position).toEqual([
      4, 0, 0,
    ]);

    bus.undo();
    expect(scene.findObjectById(TEST_IDS.mesh)?.transform.position).toEqual([
      0, 0, 0,
    ]);

    bus.redo();
    expect(scene.findObjectById(TEST_IDS.mesh)?.transform.position).toEqual([
      4, 0, 0,
    ]);
  });

  it("sets history flags on the session", () => {
    const { bus } = createRuntime();

    bus.execute(CommandType.TransformObject, {
      objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
      position: [1, 0, 0],
    });
    expect(useSessionStore.getState().canUndo).toBe(true);
    expect(useSessionStore.getState().canRedo).toBe(false);

    bus.undo();
    expect(useSessionStore.getState().canUndo).toBe(false);
    expect(useSessionStore.getState().canRedo).toBe(true);
  });

  it("clears redo when a new command is executed", () => {
    const { scene, bus } = createRuntime();

    bus.execute(CommandType.TransformObject, {
      objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
      position: [1, 0, 0],
    });
    bus.undo();
    bus.execute(CommandType.TransformObject, {
      objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
      position: [2, 0, 0],
    });

    bus.redo();
    expect(scene.findObjectById(TEST_IDS.mesh)?.transform.position).toEqual([
      2, 0, 0,
    ]);
  });

  it("adds a light, transforms it, then undoes and redoes the transform", () => {
    const { scene, bus } = createRuntime();

    bus.execute(CommandType.AddObject, { kind: "Light", id: "light-new" });
    expect(scene.findObjectById("light-new")?.kind).toBe("Light");
    expect(scene.findObjectById("light-new")?.transform.position).toEqual([
      0, 5, 0,
    ]);

    bus.execute(CommandType.TransformObject, {
      objectRef: { id: "light-new", kind: "Light" },
      position: [1, 2, 3],
    });
    expect(scene.findObjectById("light-new")?.transform.position).toEqual([
      1, 2, 3,
    ]);

    bus.undo();
    expect(scene.findObjectById("light-new")?.transform.position).toEqual([
      0, 5, 0,
    ]);

    bus.redo();
    expect(scene.findObjectById("light-new")?.transform.position).toEqual([
      1, 2, 3,
    ]);
  });

  it("hard-deletes a soft-deleted object when its restore snapshot is evicted", () => {
    const { scene, history, bus } = createRuntime();

    bus.execute(CommandType.DeleteObject, {
      id: TEST_IDS.light,
      isDelete: true,
      kind: "Light",
    });
    expect(scene.findObjectById(TEST_IDS.light)?.pendingDelete).toBe(true);

    for (let index = 0; index < history.maxCount; index += 1) {
      bus.execute(CommandType.TransformObject, {
        objectRef: { id: TEST_IDS.mesh, kind: "Mesh" },
        position: [index, 0, 0],
      });
    }

    expect(scene.findObjectById(TEST_IDS.light)).toBeNull();
  });
});
