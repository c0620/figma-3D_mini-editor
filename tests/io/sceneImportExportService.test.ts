import { beforeEach, describe, expect, it, vi } from "vitest";

import { SceneEncoder } from "@/io/sceneEncoder";
import { SceneImportExportService } from "@/io/sceneImportExportService";
import type { OperationContext } from "@/services/information/operationContext";
import { SceneAnalyzer } from "@/services/sceneAnalyzerService";
import { SceneStorage } from "@/store/sceneStorage";

import { loadBasicScene, resetStores } from "../helpers/resetStores";
import {
  TEST_IDS,
  createBasicScene,
  createLight,
} from "../helpers/sceneFixtures";

function stubContext(aborted = false): OperationContext {
  return {
    ask: vi.fn(),
    log: vi.fn(),
    isAborted: () => aborted,
  } as unknown as OperationContext;
}

describe("SceneImportExportService", () => {
  const storage = new SceneStorage();
  const encoder = {
    import: vi.fn(),
    export: vi.fn(),
  };
  const service = new SceneImportExportService(
    encoder as unknown as SceneEncoder,
    storage,
    new SceneAnalyzer()
  );

  beforeEach(() => {
    resetStores();
    encoder.import.mockReset();
    encoder.export.mockReset();
  });

  it("loads an imported scene when the context is not aborted", async () => {
    const imported = createBasicScene({ id: "imported" });
    encoder.import.mockResolvedValue(imported);

    const result = await service.importFromDevice(
      "OBJ",
      "payload",
      stubContext()
    );

    expect(encoder.import).toHaveBeenCalledWith(
      "OBJ",
      "payload",
      "LoadScene",
      expect.anything()
    );
    expect(result?.id).toBe("imported");
    expect(storage.getScene().id).toBe("imported");
  });

  it("does not load when the context was aborted", async () => {
    encoder.import.mockResolvedValue(createBasicScene({ id: "imported" }));

    await service.importFromDevice("OBJ", "payload", stubContext(true));
    expect(storage.getSceneOrNull()).toBeNull();
  });

  it("adds imported objects into the current scene", async () => {
    storage.load(loadBasicScene());
    const extra = createLight({ id: "light-imported", target: null });
    encoder.import.mockResolvedValue(
      createBasicScene({
        lights: { [extra.id]: extra },
        meshes: {},
        groups: {},
        cameras: {},
        materials: {},
        sceneGraph: { roots: [extra.id], graphThree: {} },
      })
    );

    await service.addFromDevice("GLB", new ArrayBuffer(0), stubContext());

    expect(encoder.import).toHaveBeenCalledWith(
      "GLB",
      expect.any(ArrayBuffer),
      "AddScene",
      expect.anything()
    );
    expect(storage.findObjectById("light-imported")?.kind).toBe("Light");
    expect(storage.findObjectById(TEST_IDS.mesh)?.kind).toBe("Mesh");
  });

  it("wraps encoder export in a Blob", () => {
    storage.load(loadBasicScene());
    encoder.export.mockReturnValue("glb-bytes");

    const blob = service.exportToDevice("GLB");
    expect(encoder.export).toHaveBeenCalledWith("GLB", storage.getScene());
    expect(blob).toBeInstanceOf(Blob);
  });
});
