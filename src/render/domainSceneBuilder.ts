import {
  AmbientLight,
  Color,
  EquirectangularReflectionMapping,
  Group,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PMREMGenerator,
  Scene as ThreeScene,
  SpotLight,
  WebGLRenderer,
  type BufferGeometry,
  type MeshStandardMaterial,
  type Texture,
} from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import { getHdriPresetUrl } from "../lights/hdriPresets";
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import {
  activeZoom,
  TextureSlot,
  type CameraState,
  type Light,
  type Scene,
} from "../types/scene";
import {
  buildMeshStandardMaterialFromDomain,
  disposeMeshStandardMaterial,
} from "./domainMaterialBuilder";

export interface DomainSceneBuildOptions {
  includeCamera: boolean;
}

export interface BuiltThreeScene {
  root: ThreeScene;
  dispose(): void;
}

const TEXTURE_DISPOSE_OPTS = { disposeTextures: true } as const;

function createCameraFromDomainState(
  state: CameraState,
  projectionAspect: number
): PerspectiveCamera | OrthographicCamera {
  let camera: PerspectiveCamera | OrthographicCamera;

  if (state.type === "Perspective") {
    camera = new PerspectiveCamera(
      state.fov,
      projectionAspect,
      state.near,
      state.far
    );
  } else {
    const halfH = 1;
    const halfW = halfH * projectionAspect;
    camera = new OrthographicCamera(
      -halfW,
      halfW,
      halfH,
      -halfH,
      state.near,
      state.far
    );
  }

  camera.zoom = activeZoom(state);
  const [px, py, pz] = state.transform.position;
  const [rx, ry, rz] = state.transform.rotation;
  camera.position.set(px, py, pz);
  camera.rotation.set(rx, ry, rz);
  const [tx, ty, tz] = state.orbitTarget;
  camera.lookAt(tx, ty, tz);
  camera.updateProjectionMatrix();

  return camera;
}

export function createRenderCameraFromDomainState(
  state: CameraState,
  viewportWidth: number,
  viewportHeight: number
): PerspectiveCamera | OrthographicCamera {
  const projectionAspect =
    viewportHeight > 0 ? viewportWidth / viewportHeight : state.aspect;
  return createCameraFromDomainState(state, projectionAspect);
}

async function loadHdriEnvironment(
  presetId: Light["hdriPreset"],
  pmrem: PMREMGenerator,
  rgbeLoader: RGBELoader
): Promise<Texture> {
  const url = getHdriPresetUrl(presetId);
  const hdrTexture = await rgbeLoader.loadAsync(url);
  hdrTexture.mapping = EquirectangularReflectionMapping;
  const envMap = pmrem.fromEquirectangular(hdrTexture).texture;
  hdrTexture.dispose();
  return envMap;
}

function addSpotLight(root: ThreeScene, light: Light): void {
  const group = new Group();
  const [px, py, pz] = light.transform.position;
  const [rx, ry, rz] = light.transform.rotation;
  const [sx, sy, sz] = light.transform.scale;
  group.position.set(px, py, pz);
  group.rotation.set(rx, ry, rz);
  group.scale.set(sx, sy, sz);
  group.visible = light.visible;

  const spot = new SpotLight(
    light.color,
    light.intensity,
    light.distance,
    light.angle,
    light.penumbra
  );
  const [tx, ty, tz] = light.target;
  spot.target.position.set(tx, ty, tz);
  group.add(spot);
  group.add(spot.target);
  root.add(group);
}

export async function buildThreeSceneFromDomain(
  scene: Scene,
  options: DomainSceneBuildOptions
): Promise<BuiltThreeScene> {
  const root = new ThreeScene();
  const disposableGeometries: BufferGeometry[] = [];
  const disposableMaterials: MeshStandardMaterial[] = [];
  let pmrem: PMREMGenerator | null = null;
  let hdriRenderer: WebGLRenderer | null = null;
  let envMap: Texture | null = null;

  if (scene.environment.backgroundColor) {
    root.background = new Color(scene.environment.backgroundColor);
  }

  const visibleLights = scene.lights.filter(
    (l) => l.visible && !l.pendingDelete
  );
  const hdriLight = visibleLights.find((l) => l.type === "HDRI");

  if (hdriLight) {
    hdriRenderer = new WebGLRenderer({ antialias: false, alpha: true });
    hdriRenderer.setSize(16, 16);
    pmrem = new PMREMGenerator(hdriRenderer);
    pmrem.compileEquirectangularShader();
    const rgbeLoader = new RGBELoader();
    envMap = await loadHdriEnvironment(
      hdriLight.hdriPreset,
      pmrem,
      rgbeLoader
    );
    root.environment = envMap;
    root.environmentIntensity = hdriLight.intensity;
  }

  for (const light of visibleLights) {
    if (light.type === "Ambient") {
      const ambient = new AmbientLight(light.color, light.intensity);
      ambient.visible = light.visible;
      root.add(ambient);
      continue;
    }

    if (light.type === "Spot") {
      addSpotLight(root, light);
    }
  }

  for (const mesh of scene.meshes) {
    if (mesh.pendingDelete) continue;

    const asset = threeAssetRegistry.get(mesh.id);
    if (!asset) continue;

    const geometry = asset.geometry.clone();
    disposableGeometries.push(geometry);

    const threeMaterials = await Promise.all(
      mesh.materialIDs.map(async (materialId) => {
        const domainMaterial = scene.materials[materialId];
        if (!domainMaterial) {
          const fallback = await buildMeshStandardMaterialFromDomain({
            id: materialId,
            baseColor: "#cccccc",
            roughness: 1,
            metalness: 0,
            emissive: "#000000",
            emissiveIntensity: 1,
            textures: {
              [TextureSlot.BaseColor]: null,
              [TextureSlot.Normal]: null,
              [TextureSlot.Roughness]: null,
              [TextureSlot.Metalness]: null,
              [TextureSlot.Emissive]: null,
            },
            name: materialId,
          });
          disposableMaterials.push(fallback);
          return fallback;
        }
        const built = await buildMeshStandardMaterialFromDomain(domainMaterial);
        disposableMaterials.push(built);
        return built;
      })
    );

    const threeMesh = new Mesh(
      geometry,
      threeMaterials.length === 1 ? threeMaterials[0]! : threeMaterials
    );
    const [px, py, pz] = mesh.transform.position;
    const [rx, ry, rz] = mesh.transform.rotation;
    const [sx, sy, sz] = mesh.transform.scale;
    threeMesh.position.set(px, py, pz);
    threeMesh.rotation.set(rx, ry, rz);
    threeMesh.scale.set(sx, sy, sz);
    threeMesh.visible = mesh.visible;
    threeMesh.name = mesh.name;
    root.add(threeMesh);
  }

  if (options.includeCamera) {
    const exportCamera = createCameraFromDomainState(
      scene.camera,
      scene.camera.aspect
    );
    root.add(exportCamera);
  }

  return {
    root,
    dispose() {
      for (const geometry of disposableGeometries) {
        geometry.dispose();
      }
      for (const material of disposableMaterials) {
        disposeMeshStandardMaterial(material, TEXTURE_DISPOSE_OPTS);
      }
      envMap?.dispose();
      pmrem?.dispose();
      hdriRenderer?.dispose();
    },
  };
}
