export enum TextureSlot {
  BaseColor = "BaseColor",
  Normal = "Normal",
  Roughness = "Roughness",
  Metalness = "Metalness",
  Emissive = "Emissive",
}

export interface Material {
  id: string;
  baseColor: string;
  roughness: number;
  metalness: number;
  emissive: string;
  textures: Record<TextureSlot, string | null>;
}

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SceneObject {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  pendingDelete: boolean;
  transform: Transform;
  materialId: string;
}

export interface Light {
  id: string;
  type: "Directional" | "Ambient" | "HDRI";
  color: string;
  intensity: number;
  visible: boolean;
  locked: boolean;
}

export interface CameraState {
  type: "Perspective" | "Orthographic";
  zoom: number;
  position: [number, number, number];
  target: [number, number, number];
  locked: boolean;
}

export interface EnvironmentState {
  backgroundColor: string | null;
  shadowsEnabled: boolean;
}

export interface Scene {
  id: string;
  objects: SceneObject[];
  materials: Record<string, Material>;
  lights: Light[];
  camera: CameraState;
  environment: EnvironmentState;
}
