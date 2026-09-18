import { Color } from "three";

import {
  CameraType,
  LightType,
  TextureSlot,
  type Material,
  type Scene,
  type SceneCamera,
  type SceneGroup,
  type SceneLight,
  type SceneMesh,
  type Transform,
} from "@/types/scene";

export const TEST_IDS = {
  scene: "scene-1",
  camera: "cam-1",
  mesh: "mesh-1",
  light: "light-1",
  group: "group-1",
  childMesh: "mesh-child",
  material: "mat-1",
} as const;

export function identityTransform(
  overrides: Partial<Transform> = {}
): Transform {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    ...overrides,
  };
}

export function createMaterial(
  overrides: Partial<Material> = {}
): Material {
  return {
    id: TEST_IDS.material,
    name: "Material",
    color: { type: "custom", value: new Color(0xffffff) },
    roughness: 0.5,
    metalness: 0,
    emissiveIntensity: 0,
    textures: {
      [TextureSlot.BaseColor]: null,
      [TextureSlot.Normal]: null,
      [TextureSlot.Roughness]: null,
      [TextureSlot.Metalness]: null,
      [TextureSlot.Emissive]: null,
    },
    ...overrides,
  };
}

export function createCamera(
  overrides: Partial<SceneCamera> = {}
): SceneCamera {
  return {
    id: TEST_IDS.camera,
    kind: "Camera",
    type: CameraType.Perspective,
    name: "Camera",
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

export function createMesh(overrides: Partial<SceneMesh> = {}): SceneMesh {
  return {
    id: TEST_IDS.mesh,
    kind: "Mesh",
    name: "Mesh",
    visible: true,
    locked: false,
    pendingDelete: false,
    parentId: null,
    transform: identityTransform(),
    materials: [TEST_IDS.material],
    ...overrides,
  };
}

export function createLight(overrides: Partial<SceneLight> = {}): SceneLight {
  return {
    id: TEST_IDS.light,
    kind: "Light",
    type: LightType.Spot,
    name: "Light",
    visible: true,
    locked: false,
    pendingDelete: false,
    parentId: null,
    transform: identityTransform({ position: [0, 5, 0] }),
    color: { type: "custom", value: new Color(0xffffff) },
    intensity: 1,
    distance: 0,
    angle: Math.PI / 3,
    penumbra: 0,
    decay: 2,
    target: TEST_IDS.mesh,
    ...overrides,
  };
}

export function createGroup(overrides: Partial<SceneGroup> = {}): SceneGroup {
  return {
    id: TEST_IDS.group,
    kind: "Group",
    name: "Group",
    visible: true,
    locked: false,
    pendingDelete: false,
    parentId: null,
    transform: identityTransform(),
    ...overrides,
  };
}

/** Сцена с камерой, мешем, светом и группой с дочерним мешем. */
export function createBasicScene(overrides: Partial<Scene> = {}): Scene {
  const camera = createCamera();
  const mesh = createMesh();
  const light = createLight();
  const group = createGroup();
  const child = createMesh({
    id: TEST_IDS.childMesh,
    name: "Child Mesh",
    parentId: TEST_IDS.group,
  });
  const material = createMaterial();

  return {
    id: TEST_IDS.scene,
    materials: { [material.id]: material },
    meshes: { [mesh.id]: mesh, [child.id]: child },
    lights: { [light.id]: light },
    groups: { [group.id]: group },
    cameras: { [camera.id]: camera },
    environment: { backgroundColor: null, shadowsEnabled: false },
    sceneGraph: {
      roots: [camera.id, mesh.id, light.id, group.id],
      graphThree: { [group.id]: [child.id] },
    },
    ...overrides,
  };
}
