import { beforeEach, describe, expect, it, test, vi } from "vitest";

import { SceneEncoder } from "@/io/sceneEncoder";
import { DeviceImportExportService } from "@/io/deviceImportExportService";
import type { OperationContext } from "@/services/alert/operationContext";
import { SceneAnalyzer } from "@/services/sceneAnalyzerService";
import { SceneStorage } from "@/store/sceneStorage";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.resolve(__dirname, "../3d/lamp.glb");

const fileBuffer = await readFile(modelPath);

const model3D = fileBuffer.buffer.slice(
  fileBuffer.byteOffset,
  fileBuffer.byteOffset + fileBuffer.byteLength
);

describe("DeviceImportExportService", () => {
  const storage = new SceneStorage();
  const encoder = new SceneEncoder(storage);
  const service = new DeviceImportExportService(
    encoder,
    storage,
    new SceneAnalyzer()
  );

  beforeEach(() => {
    resetStores();
  });

  test("loads an imported scene when the context is not aborted", async () => {
    vi.spyOn(encoder, "import");
    const result = await service.importFromDevice(
      "GLB",
      model3D as ArrayBuffer,
      stubContext()
    );

    expect(encoder.import).toHaveBeenCalledWith(
      "GLB",
      model3D as ArrayBuffer,
      "LoadScene",
      expect.anything()
    );

    expect(result?.id).toBe(storage.getScene().id);
  });

  test("does not load when the context was aborted", async () => {
    await service.importFromDevice(
      "GLB",
      model3D as ArrayBuffer,
      stubContext(true)
    );
    expect(storage.getSceneOrNull()).toBeNull();
  });

  test.todo("adds imported objects into the current scene", async () => {
    storage.load(loadBasicScene());

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

  test.todo("import files with correct types");
  test.todo("appends a new scene to the existing scene");
});
