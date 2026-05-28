import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createPrimitiveObject3D } from "../library/primitiveSceneFactory";
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import { TextureSlot } from "../types/scene";
import {
  importThreeObjectAsScene,
  importThreeObjectAsSceneAppend,
} from "./sceneEncoder";

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    putImageData: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    function (callback) {
      callback(
        new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" })
      );
    }
  );
});

function createTexturedBoxGroup(meshName: string): Group {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;

  const map = new CanvasTexture(canvas);
  const material = new MeshStandardMaterial({ map });
  const mesh = new Mesh(new BoxGeometry(1, 1, 1), material);
  mesh.name = meshName;
  const group = new Group();
  group.add(mesh);
  return group;
}

function disposeGroup(root: Group): void {
  root.traverse((child) => {
    if (child instanceof Mesh) {
      child.geometry.dispose();
      const mat = child.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
  });
}

afterEach(() => {
  threeAssetRegistry.clear();
});

describe("importThreeObjectAsSceneAppend", () => {
  it("does not revoke blob texture URLs from a prior replace import", async () => {
    const textured = createTexturedBoxGroup("TexturedBox");
    const scene = await importThreeObjectAsScene(textured, {
      syncTextures: false,
    });

    const materialId = scene.meshes[0]?.materialIDs[0];
    expect(materialId).toBeDefined();
    const textureUrl =
      scene.materials[materialId!].textures[TextureSlot.BaseColor]?.url;
    expect(textureUrl).toMatch(/^blob:/);

    const revokedUrls: string[] = [];
    const revokeSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation((url) => {
        revokedUrls.push(url);
      });

    const primitive = createPrimitiveObject3D("sphere", "Sphere");
    await importThreeObjectAsSceneAppend(primitive);

    expect(revokedUrls).not.toContain(textureUrl);

    revokeSpy.mockRestore();
    disposeGroup(textured);
    disposeGroup(primitive);
  });
});
