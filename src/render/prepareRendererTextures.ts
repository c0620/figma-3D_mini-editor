import {
  Mesh,
  MeshStandardMaterial,
  Scene as ThreeScene,
  WebGLRenderer,
  type Texture,
} from "three";

const MATERIAL_MAP_KEYS = [
  "map",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "emissiveMap",
] as const;

function initMaterialTextures(
  renderer: WebGLRenderer,
  material: MeshStandardMaterial
): void {
  for (const key of MATERIAL_MAP_KEYS) {
    const texture = material[key];
    if (texture) {
      renderer.initTexture(texture);
    }
  }
}

/** Uploads scene textures into the export renderer's WebGL context. */
export function prepareTexturesForRenderer(
  root: ThreeScene,
  renderer: WebGLRenderer
): void {
  if (root.environment) {
    renderer.initTexture(root.environment);
  }

  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;

    const { material } = obj;
    if (Array.isArray(material)) {
      for (const mat of material) {
        if (mat instanceof MeshStandardMaterial) {
          initMaterialTextures(renderer, mat);
        }
      }
      return;
    }

    if (material instanceof MeshStandardMaterial) {
      initMaterialTextures(renderer, material);
    }
  });
}

/** Mirrors previewService: explicit envMap on PBR materials. */
export function applyEnvironmentToMaterials(
  root: ThreeScene,
  envMap: Texture
): void {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;

    const apply = (mat: MeshStandardMaterial) => {
      mat.envMap = envMap;
      mat.needsUpdate = true;
    };

    const { material } = obj;
    if (Array.isArray(material)) {
      for (const mat of material) {
        if (mat instanceof MeshStandardMaterial) apply(mat);
      }
      return;
    }

    if (material instanceof MeshStandardMaterial) {
      apply(material);
    }
  });
}
