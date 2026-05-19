import { beforeEach, describe, expect, it } from "vitest";

import { ActionExecutor } from "@/commands/actionExecutor";
import { ActionReverter } from "@/commands/actionReverter";
import { CommandBus } from "@/commands/commandBus";
import { DeletionGarbageCollector } from "@/commands/deletionGarbageCollector";
import { BaseToolHandler } from "@/handlers/baseToolHandler";
import { DeletionHandler } from "@/handlers/deletionHandler";
import { TextureImportHandler } from "@/handlers/textureImportHandler";
import { History } from "@/store/history";
import { SceneStorage } from "@/store/sceneStorage";
import { useSceneStore } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";
import { CommandType } from "@/types/commands";
import { TextureSlot } from "@/types/scene";

import { createMinimalScene } from "../helpers/minimalScene";

function resetStores(): void {
  useSceneStore.setState({ scene: null });
  useSessionStore.setState({
    activeObjectId: null,
    projectName: "",
    notifications: [],
    canUndo: false,
    canRedo: false,
    locale: "ru",
  });
}

function createCommandBus(storage: SceneStorage): CommandBus {
  const history = new History();
  const executor = new ActionExecutor(storage);
  const reverter = new ActionReverter(storage);
  const gc = new DeletionGarbageCollector(storage);

  executor.handlers.set(CommandType.DeleteModel, new DeletionHandler(storage));
  executor.handlers.set(
    CommandType.TransformObject,
    new BaseToolHandler(storage)
  );

  return new CommandBus(history, executor, reverter, gc);
}

describe("интеграция удаления моделей и sessionStore", () => {
  beforeEach(() => {
    resetStores();
  });

  it("DeleteModel скрывает объект", () => {
    const storage = new SceneStorage();
    const bus = createCommandBus(storage);

    storage.load(createMinimalScene());
    bus.execute(CommandType.DeleteModel, { modelId: "mesh-1" });

    const obj = storage.findObjectById("mesh-1");
    expect(obj).not.toBeNull();
    expect(obj!.visible).toBe(false);
    expect(obj!.pendingDelete).toBe(true);

    const fromStore = useSceneStore.getState().scene!.objects[0];
    expect(fromStore.visible).toBe(false);
    expect(fromStore.pendingDelete).toBe(true);
  });

  it("после DeleteModel синхронизируются состояние переключателей истории в SessionStore", () => {
    const storage = new SceneStorage();
    const bus = createCommandBus(storage);

    storage.load(createMinimalScene());
    bus.execute(CommandType.DeleteModel, { modelId: "mesh-1" });

    expect(useSessionStore.getState().canUndo).toBe(true);
    expect(useSessionStore.getState().canRedo).toBe(false);
  });
});

describe("интеграция: TextureImportHandler → patchMaterial → Zustand", () => {
  beforeEach(() => {
    resetStores();
  });

  it("запись URL текстуры создаёт новый объект Material в сторе", () => {
    const storage = new SceneStorage();
    const handler = new TextureImportHandler(storage);

    storage.load(createMinimalScene());
    const sceneBefore = useSceneStore.getState().scene;
    const matBefore = sceneBefore!.materials["mat-1"];

    handler.execute({
      materialId: "mat-1",
      slot: TextureSlot.BaseColor,
      url: "blob:https://example/base-color.png",
    });

    const sceneAfter = useSceneStore.getState().scene;
    const matAfter = sceneAfter!.materials["mat-1"];

    expect(matAfter.textures[TextureSlot.BaseColor]).toBe(
      "blob:https://example/base-color.png"
    );
    expect(matAfter).not.toBe(matBefore);
    expect(sceneAfter).not.toBe(sceneBefore);
    expect(matBefore.textures[TextureSlot.BaseColor]).toBeNull();
  });

  it("patchMaterial не затирает остальные слоты текстур", () => {
    const storage = new SceneStorage();
    const handler = new TextureImportHandler(storage);

    storage.load(createMinimalScene());
    storage.patchMaterial("mat-1", {
      textures: { [TextureSlot.Normal]: "blob:normal.png" },
    });

    handler.execute({
      materialId: "mat-1",
      slot: TextureSlot.BaseColor,
      url: "blob:base.png",
    });

    const mat = storage.getScene().materials["mat-1"];
    expect(mat.textures[TextureSlot.BaseColor]).toBe("blob:base.png");
    expect(mat.textures[TextureSlot.Normal]).toBe("blob:normal.png");
  });
});

describe("интеграция: CommandBus + SceneTool (TransformObject) + SceneStorage", () => {
  beforeEach(() => {
    resetStores();
  });

  it("TransformObject меняет только position и обновляет SceneStore", () => {
    const storage = new SceneStorage();
    const bus = createCommandBus(storage);

    storage.load(createMinimalScene());
    const sceneBefore = useSceneStore.getState().scene;
    const objBefore = sceneBefore!.objects[0];

    bus.execute(CommandType.TransformObject, {
      id: "mesh-1",
      position: [1, 2, 3],
    });

    const viaStorage = storage.findObjectById("mesh-1")!;
    expect(viaStorage.transform.position).toEqual([1, 2, 3]);
    expect(viaStorage.transform.rotation).toEqual(objBefore.transform.rotation);
    expect(viaStorage.transform.scale).toEqual(objBefore.transform.scale);

    const objAfter = useSceneStore.getState().scene!.objects[0];
    expect(objAfter.transform.position).toEqual([1, 2, 3]);
    expect(objAfter).not.toBe(objBefore);
    expect(useSceneStore.getState().scene).not.toBe(sceneBefore);

    expect(useSessionStore.getState().canUndo).toBe(true);
    expect(useSessionStore.getState().canRedo).toBe(false);
  });

  it("TransformObject без id в payload берёт activeObjectId из SessionStore", () => {
    const storage = new SceneStorage();
    const bus = createCommandBus(storage);

    storage.load(createMinimalScene());
    useSessionStore.getState().setActiveObjectId("mesh-1");

    bus.execute(CommandType.TransformObject, { position: [0, 1, 0] });

    expect(storage.findObjectById("mesh-1")!.transform.position).toEqual([
      0, 1, 0,
    ]);
    expect(
      useSceneStore.getState().scene!.objects[0].transform.position
    ).toEqual([0, 1, 0]);
  });
});
