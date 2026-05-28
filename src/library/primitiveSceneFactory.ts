import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  TorusKnotGeometry,
} from "three";

import type { PrimitiveKind } from "../types/assets";

export function countGeometryPolygons(geometry: BufferGeometry): number {
  if (geometry.index) {
    return Math.floor(geometry.index.count / 3);
  }
  const position = geometry.attributes.position;
  if (!position) return 0;
  return Math.floor(position.count / 3);
}

export function createPrimitiveGeometry(kind: PrimitiveKind): BufferGeometry {
  switch (kind) {
    case "box":
      return new BoxGeometry(1, 1, 1);
    case "sphere":
      return new SphereGeometry(0.6, 32, 32);
    case "cylinder":
      return new CylinderGeometry(0.5, 0.5, 1, 32);
    case "cone":
      return new ConeGeometry(0.5, 1, 32);
    case "torus":
      return new TorusGeometry(0.45, 0.18, 24, 48);
    case "plane":
      return new PlaneGeometry(1.2, 1.2);
    case "icosahedron":
      return new IcosahedronGeometry(0.65, 0);
    case "torusKnot":
      return new TorusKnotGeometry(0.45, 0.14, 128, 16);
  }
}

export function createPrimitiveObject3D(
  kind: PrimitiveKind,
  meshName: string
): Group {
  const geometry = createPrimitiveGeometry(kind);
  const material = new MeshStandardMaterial({
    color: 0xc8c8c8,
    metalness: 0.85,
    roughness: 0.2,
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = meshName;
  const group = new Group();
  group.add(mesh);
  return group;
}
