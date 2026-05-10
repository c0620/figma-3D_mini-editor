export enum TextureSlot {
  BaseColor = 'BaseColor',
  Normal = 'Normal',
  Roughness = 'Roughness',
  Metalness = 'Metalness',
  Emissive = 'Emissive',
}

export interface Material {
  id: string;
  baseColor: string;
  roughness: number;
  metalness: number;
  emissive: string;
  textures: Map<TextureSlot, string>;
}

export interface SceneObject {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  pendingDelete: boolean;
  transform: object;
  material: Material;
}

export interface Light {
  id: string;
  type: 'Directional' | 'Ambient';
  color: string;
  intensity: number;
}

export interface CameraState {
  type: 'Perspective' | 'Orthographic';
  zoom: number;
  position: object;
  target: object;
}

export interface EnvironmentState {
  backgroundColor: string | null;
  shadowsEnabled: boolean;
}

export interface Scene {
  id: string;
  objects: SceneObject[];
  lights: Light[];
  camera: CameraState;
  environment: EnvironmentState;
}
