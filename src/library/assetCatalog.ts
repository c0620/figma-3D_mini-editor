import type { Asset, PrimitiveKind } from "../types/assets";
import {
  countGeometryPolygons,
  createPrimitiveGeometry,
} from "./primitiveSceneFactory";

function primitiveAsset(
  id: string,
  nameKey: Asset["nameKey"],
  kind: PrimitiveKind
): Asset {
  const geometry = createPrimitiveGeometry(kind);
  const polygonCount = countGeometryPolygons(geometry);
  geometry.dispose();
  return {
    id,
    nameKey,
    tags: ["primitive"],
    primitiveKind: kind,
    polygonCount,
  };
}

export const LIBRARY_ASSETS: Asset[] = [
  primitiveAsset("box", "library.asset.box.name", "box"),
  primitiveAsset("sphere", "library.asset.sphere.name", "sphere"),
  primitiveAsset("cylinder", "library.asset.cylinder.name", "cylinder"),
  primitiveAsset("cone", "library.asset.cone.name", "cone"),
  primitiveAsset("torus", "library.asset.torus.name", "torus"),
  primitiveAsset("plane", "library.asset.plane.name", "plane"),
  primitiveAsset("icosahedron", "library.asset.icosahedron.name", "icosahedron"),
  primitiveAsset("torusKnot", "library.asset.torusKnot.name", "torusKnot"),
];

export const LIBRARY_TAG_COUNT = 3;
