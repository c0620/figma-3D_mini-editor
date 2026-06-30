import type { BufferGeometry, Color, Material as ThreeMaterial } from "three";

export type ObjectID = string;
export type CameraID = string;
export type MaterialID = string;
export type TextureMiniature = unknown;

export enum TextureSlot {
  BaseColor = "map",
  Normal = "normalMap",
  Roughness = "roughnessMap",
  Metalness = "metalnessMap",
  Emissive = "emissiveMap",
}

export interface Material {
  id: MaterialID;
  name: string;
  color: Color;
  roughness: number;
  metalness: number;
  emissiveIntensity: number;
  textures: Record<TextureSlot, TextureMiniature | null>;
}

export type ThreeAssetMaterial = MaterialID;

export interface ThreeAsset {
  geometry: BufferGeometry;
  materials: ThreeAssetMaterial[];
}

export type SceneUtilKind = "Environment";
export type SceneObjectKind = "Light" | "Mesh" | "Group" | "Camera";

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

interface BasicSceneObject {
  id: ObjectID;
  name: string;
  kind: SceneObjectKind;
  visible: boolean;
  locked: boolean;
  transform: Transform;
  pendingDelete: boolean;
  parentId: ObjectID | null;
}

export interface SceneMesh extends BasicSceneObject {
  materials: MaterialID[];
  kind: "Mesh";
}

export interface SceneLight extends BasicSceneObject {
  type: "Spot" | "Ambient" | "HDRI";
  color: string;
  intensity: number;
  kind: "Light";
}

export interface SceneGroup extends BasicSceneObject {
  kind: "Group";
}

export interface CameraState extends Omit<BasicSceneObject, "visible"> {
  id: CameraID;
  kind: "Camera";
  type: "Perspective" | "Orthographic";
  zoom: number;
  transform: Transform;
  locked: boolean;
}

export interface EnvironmentState {
  backgroundColor: string | null;
  shadowsEnabled: boolean;
}

export type SceneObject = SceneLight | SceneMesh | SceneGroup;

export interface SceneGraph {
  roots: ObjectID[];
  objects: Record<ObjectID, SceneObject>;
  graphThree: Record<ObjectID, ObjectID[]>;
}

export interface Scene {
  id: string;
  materials: Record<MaterialID, Material>;
  sceneGraph: SceneGraph;
  cameras: Record<CameraID, CameraState>;
  environment: EnvironmentState;
}

export type ObjectRef =
  | { kind: SceneUtilKind; id: CameraID }
  | { kind: SceneObjectKind; id: ObjectID };

export type ActiveEntity = SceneMesh | SceneLight | SceneGroup | CameraState;
