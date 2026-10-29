import { afterEach, describe, expect, it, vi } from "vitest";

import type { OperationContext } from "@/services/alert/operationContext";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import { IDs, SceneEncoder } from "@/io/sceneEncoder";
import { SceneStorage } from "@/store/sceneStorage";

const TRIANGLE_OBJ = [
  "v 0.0 0.0 0.0",
  "v 1.0 0.0 0.0",
  "v 0.0 1.0 0.0",
  "f 1 2 3",
].join("\n");

function stubContext(): OperationContext {
  return {
    ask: vi.fn(async (question) => ({ ...question, choice: false })),
    log: vi.fn(),
    isAborted: () => false,
  } as unknown as OperationContext;
}

describe("SceneEncoder.import", () => {
  afterEach(() => {
    threeAssetRegistry.clear();
    threeAssetRegistry.materials = {};
  });

  it("parses an OBJ mesh and fills in plugin camera and lights on LoadScene", async () => {
    const sceneStorage = new SceneStorage();
    const encoder = new SceneEncoder(sceneStorage);
    const context = stubContext();
    const result = await encoder.import(
      "OBJ",
      TRIANGLE_OBJ,
      "LoadScene",
      context
    );

    const scene = result.scene;

    expect(Object.keys(scene.meshes).length).toBeGreaterThan(0);
    expect(scene.cameras[IDs.PluginCamera]).toMatchObject({
      kind: "Camera",
      name: "Plugin Camera",
    });
    expect(scene.lights[IDs.PluginSpotLight]?.kind).toBe("Light");
    expect(scene.lights[IDs.PluginAmbientLight]?.kind).toBe("Light");
    expect(scene.sceneGraph.roots).toEqual(
      expect.arrayContaining([
        IDs.PluginCamera,
        IDs.PluginSpotLight,
        IDs.PluginAmbientLight,
      ])
    );
    expect(context.log).toHaveBeenCalled();
  });

  it("does not inject plugin lights when adding into an existing scene", async () => {
    const sceneStorage = new SceneStorage();
    const encoder = new SceneEncoder(sceneStorage);
    const context = stubContext();
    const result = await encoder.import(
      "OBJ",
      TRIANGLE_OBJ,
      "AddScene",
      context
    );

    const scene = result.scene;

    expect(scene.cameras[IDs.PluginCamera]).toBeUndefined();
    expect(scene.lights[IDs.PluginSpotLight]).toBeUndefined();
    expect(Object.keys(scene.meshes).length).toBeGreaterThan(0);
  });
});
