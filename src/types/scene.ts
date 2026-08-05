import type {
  BufferGeometry,
  Color,
  Texture,
  Material as ThreeMaterial,
} from "three";

export type ObjectID = string;
export type EnvironmentID = string;
export type MaterialID = string;
export type TextureMiniature = Texture["image"] | null;

export enum TextureSlot {
  BaseColor = "map",
  Normal = "normalMap",
  Roughness = "roughnessMap",
  Metalness = "metalnessMap",
  Emissive = "emissiveMap",
}

export enum CameraType {
  Perspective = "PerspectiveCamera",
  Orthographic = "OrthographicCamera",
}

export interface FigmaColor {
  type: "figma";
  id: Variable["id"];
  name: Variable["name"];
  value: Color;
}

export interface CustomColor {
  type: "custom";
  value: Color;
}

export type MaterialColor = FigmaColor | CustomColor;

export interface Material {
  id: MaterialID;
  name: string;
  color: MaterialColor;
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

export interface BasicSceneObject {
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

export interface SceneCamera extends Omit<BasicSceneObject, "visible"> {
  id: ObjectID;
  kind: "Camera";
  type: CameraType;
  zoom: number | null;
  transform: Transform;
  locked: boolean;
  near: number;
  far: number;
  fov: number;
  aspect: number[];
  dolly: number | null;
  azimuth: number;
  polar: number;
  target: [number, number, number];
}

export interface EnvironmentState {
  backgroundColor: string | null;
  shadowsEnabled: boolean;
}

export type SceneGraphObject =
  SceneLight | SceneMesh | SceneGroup | SceneCamera;

export type SceneObject = SceneGraphObject | SceneCamera;

export interface SceneGraph {
  roots: ObjectID[];
  objects: Record<ObjectID, SceneGraphObject>;
  graphThree: Record<ObjectID, ObjectID[]>;
}

export interface Scene {
  id: string;
  materials: Record<MaterialID, Material>;
  sceneGraph: SceneGraph;
  // cameras: Record<CameraID, SceneCamera>;
  environment: EnvironmentState;
}

export type ObjectRef = { kind: SceneObjectKind; id: ObjectID };

export type ActiveEntity = SceneMesh | SceneLight | SceneGroup | SceneCamera;
