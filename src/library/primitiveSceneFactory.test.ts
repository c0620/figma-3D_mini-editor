import { Mesh } from "three";
import { describe, expect, it, afterEach } from "vitest";

import { importThreeObjectAsScene } from "../io/sceneEncoder";
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import { DEFAULT_CAMERA_STATE } from "../types/scene";
import {
  countGeometryPolygons,
  createPrimitiveGeometry,
  createPrimitiveObject3D,
} from "./primitiveSceneFactory";

afterEach(() => {
  threeAssetRegistry.clear();
});

describe("primitiveSceneFactory", () => {
  it("counts polygons for box geometry", () => {
    const geometry = createPrimitiveGeometry("box");
    const count = countGeometryPolygons(geometry);
    expect(count).toBeGreaterThan(0);
    geometry.dispose();
  });

  it("builds a domain scene with one mesh from a primitive", async () => {
    const root = createPrimitiveObject3D("sphere", "Sphere");
    const scene = await importThreeObjectAsScene(root);

    expect(scene.meshes).toHaveLength(1);
    expect(scene.meshes[0].name).toBe("Sphere");
    expect(scene.lights.length).toBeGreaterThanOrEqual(1);
    expect(scene.camera.type).toBe(DEFAULT_CAMERA_STATE.type);
    expect(threeAssetRegistry.get(scene.meshes[0].id)).toBeDefined();

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
  });
});
