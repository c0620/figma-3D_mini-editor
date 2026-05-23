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

export interface SceneMesh {
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
  transform: Transform;
  visible: boolean;
  locked: boolean;
  pendingDelete: boolean;
}

export interface CameraState {
  type: "Perspective" | "Orthographic";
  zoom: number;
  transform: Transform;
  locked: boolean;
}

export interface EnvironmentState {
  backgroundColor: string | null;
  shadowsEnabled: boolean;
}

export interface Scene {
  id: string;
  meshes: SceneMesh[];
  materials: Record<string, Material>;
  lights: Light[];
  camera: CameraState;
  environment: EnvironmentState;
}
