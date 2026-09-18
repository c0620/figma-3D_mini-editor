import { describe, expect, it } from "vitest";

import { eulerFromLookAt, normalizeCameraPatch } from "@/lib/cameraOrbit";
import { CameraType, type SceneCamera } from "@/types/scene";

import { identityTransform } from "../helpers/sceneFixtures";

function camera(overrides: Partial<SceneCamera> = {}): SceneCamera {
  return {
    id: "cam",
    kind: "Camera",
    type: CameraType.Perspective,
    name: "Cam",
    locked: false,
    pendingDelete: false,
    parentId: null,
    transform: identityTransform({ position: [0, 0, 5] }),
    zoom: null,
    near: 0.1,
    far: 1000,
    fov: 50,
    aspect: [1, 1],
    dolly: 5,
    azimuth: 0,
    polar: Math.PI / 2,
    target: [0, 0, 0],
    ...overrides,
  };
}

function expectVec3(actual: number[], expected: number[], digits = 5) {
  expected.forEach((value, index) => {
    expect(actual[index]).toBeCloseTo(value, digits);
  });
}

describe("eulerFromLookAt", () => {
  it("looks down -Z with near-zero euler when camera sits on +Z", () => {
    expectVec3(eulerFromLookAt([0, 0, 5], [0, 0, 0]), [0, 0, 0]);
  });
});

describe("normalizeCameraPatch", () => {
  it("returns the same patch when position and target already match", () => {
    const patch = {
      transform: { position: [1, 2, 3] as [number, number, number] },
      target: [0, 0, 0] as [number, number, number],
    };
    expect(normalizeCameraPatch(camera(), patch)).toBe(patch);
  });

  it("returns the same patch when the view is not touched", () => {
    const patch = { near: 0.25, fov: 35 };
    expect(normalizeCameraPatch(camera(), patch)).toBe(patch);
  });

  it("moves position when orbit angles change around the look-at point", () => {
    const next = normalizeCameraPatch(camera(), {
      azimuth: Math.PI / 2,
      polar: Math.PI / 2,
      dolly: 5,
    });

    expectVec3(next.transform?.position ?? [], [5, 0, 0]);
    expectVec3(next.target ?? [], [0, 0, 0]);
    expect(next.azimuth).toBeCloseTo(Math.PI / 2);
    expect(next.polar).toBeCloseTo(Math.PI / 2);
    expect(next.dolly).toBeCloseTo(5);
  });

  it("keeps position and moves target when rotating in place", () => {
    const current = camera();
    const next = normalizeCameraPatch(current, {
      transform: { rotation: [0, Math.PI / 2, 0] },
    });

    expectVec3(next.transform?.position ?? [], current.transform.position);
    expect(next.target).not.toEqual(current.target);
  });

  it("recomputes rotation when only position changes", () => {
    const next = normalizeCameraPatch(camera(), {
      transform: { position: [5, 0, 0] },
    });

    expectVec3(next.transform?.position ?? [], [5, 0, 0]);
    expectVec3(next.target ?? [], [0, 0, 0]);
    expectVec3(next.transform?.rotation ?? [], eulerFromLookAt([5, 0, 0], [0, 0, 0]));
  });
});
