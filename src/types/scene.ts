export enum TextureSlot {
  BaseColor = "BaseColor",
  Normal = "Normal",
  Roughness = "Roughness",
  Metalness = "Metalness",
  Emissive = "Emissive",
}

/** URL текстуры + параметры семплинга (важно для GLB: flipY = false). */
export interface StoredTexture {
  url: string;
  flipY: boolean;
  colorSpace: "srgb" | "linear";
}

export interface Material {
  id: string;
  baseColor: string;
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
  textures: Record<TextureSlot, StoredTexture | null>;
  name: string;
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
  materialIDs: string[];
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
  near: number;
  far: number;
  /** Целевое соотношение сторон рендера (не размер canvas). */
  aspect: number;
  aspectPreviewEnabled: boolean;
  /** Только для Perspective. */
  fov: number;
  /** Масштаб вида перспективной камеры (camera.zoom). */
  perspectiveZoom: number;
  /** Масштаб вида ортографической камеры (camera.zoom). */
  orthographicZoom: number;
  /** Точка, на которую смотрит камера (CameraControls target). */
  orbitTarget: [number, number, number];
  transform: Transform;
  locked: boolean;
  /** Пользовательский сохранённый ракурс (один слот, перезаписывается). */
  savedView: SavedCameraView | null;
}

export type StandardCameraPresetId =
  | "front"
  | "back"
  | "top"
  | "bottom"
  | "left"
  | "right";

export interface SavedCameraView {
  transform: Transform;
  orbitTarget: [number, number, number];
  perspectiveZoom: number;
  orthographicZoom: number;
}

/** @deprecated Legacy single zoom field from older scenes. */
type LegacyCameraState = Partial<CameraState> & { zoom?: number };

export function cameraOrbitDistance(
  position: [number, number, number],
  orbitTarget: [number, number, number]
): number {
  return (
    Math.hypot(
      position[0] - orbitTarget[0],
      position[1] - orbitTarget[1],
      position[2] - orbitTarget[2]
    ) || 5
  );
}

export function perspectiveVisibleHalfHeight(
  position: [number, number, number],
  orbitTarget: [number, number, number],
  fov: number
): number {
  const dist = cameraOrbitDistance(position, orbitTarget);
  return dist * Math.tan((fov * Math.PI) / 180 / 2);
}

export function orthographicZoomFromPerspective(
  perspectiveZoom: number,
  position: [number, number, number],
  orbitTarget: [number, number, number],
  fov: number
): number {
  const halfH = perspectiveVisibleHalfHeight(position, orbitTarget, fov);
  return perspectiveZoom / halfH;
}

export function perspectiveZoomFromOrthographic(
  orthographicZoom: number,
  position: [number, number, number],
  orbitTarget: [number, number, number],
  fov: number
): number {
  const halfH = perspectiveVisibleHalfHeight(position, orbitTarget, fov);
  return orthographicZoom * halfH;
}

export function computeDefaultOrthographicZoom(
  position: [number, number, number] = [0, 0, 5],
  orbitTarget: [number, number, number] = [0, 0, 0],
  fov = 50
): number {
  return orthographicZoomFromPerspective(1, position, orbitTarget, fov);
}

export function activeZoom(state: CameraState): number {
  return state.type === "Perspective"
    ? state.perspectiveZoom
    : state.orthographicZoom;
}

export function normalizeCameraState(camera: LegacyCameraState): CameraState {
  const legacyZoom = camera.zoom;
  const transform = camera.transform ?? DEFAULT_CAMERA_TRANSFORM;
  const orbitTarget = camera.orbitTarget ?? [0, 0, 0] as [number, number, number];
  const fov = camera.fov ?? 50;
  const defaultOrthoZoom = computeDefaultOrthographicZoom(
    transform.position,
    orbitTarget,
    fov
  );

  const { zoom: _legacy, ...rest } = camera;

  return {
    type: "Perspective",
    near: 0.1,
    far: 1000,
    aspect: 16 / 9,
    aspectPreviewEnabled: false,
    fov,
    orbitTarget,
    locked: false,
    transform,
    ...rest,
    perspectiveZoom:
      camera.perspectiveZoom ?? legacyZoom ?? 1,
    orthographicZoom:
      camera.orthographicZoom ?? legacyZoom ?? defaultOrthoZoom,
    savedView: camera.savedView ?? null,
  };
}

const DEFAULT_CAMERA_TRANSFORM: Transform = {
  position: [0, 0, 5],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

export const DEFAULT_CAMERA_STATE: CameraState = normalizeCameraState({
  type: "Perspective",
  near: 0.1,
  far: 1000,
  aspect: 16 / 9,
  aspectPreviewEnabled: false,
  fov: 50,
  perspectiveZoom: 1,
  orbitTarget: [0, 0, 0],
  locked: false,
  transform: DEFAULT_CAMERA_TRANSFORM,
});

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
