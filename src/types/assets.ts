import type { TranslationKey } from "../i18n/en";

export type AssetTag = "primitive" | "abstract" | "mockup";

export type PrimitiveKind =
  | "box"
  | "sphere"
  | "cylinder"
  | "cone"
  | "torus"
  | "plane"
  | "icosahedron"
  | "torusKnot";

export const ASSET_TAGS: AssetTag[] = ["primitive", "abstract", "mockup"];

export interface Asset {
  id: string;
  nameKey: TranslationKey;
  tags: AssetTag[];
  primitiveKind: PrimitiveKind;
  polygonCount: number;
}
