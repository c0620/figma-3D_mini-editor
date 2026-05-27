import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  LoadingManager,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Color,
  Vector3,
  Quaternion,
  Euler,
  type BufferGeometry,
  type Material as ThreeMaterial,
  type Object3D,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import { withDefaultAmbientLight } from "../lights/lightDefaults";
import { randomUUID } from "../lib/randomId";
import type { SceneExportOptions } from "../types/export";
import { buildThreeSceneFromDomain } from "../render/domainSceneBuilder";
import type { Material, Scene, SceneMesh } from "../types/scene";
import { DEFAULT_CAMERA_STATE, TextureSlot } from "../types/scene";
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import { textureGpuPool } from "../store/textureGpuPool";
import {
  extractTexturesFromThreeMaterial,
  extractTexturesFromThreeMaterialAsync,
  hasAnyTextureUrl,
  TextureUrlCache,
  type SceneImportResources,
} from "./materialTextureExtractor";

export type { SceneImportResources };

type SceneFileType = "OBJ" | "FBX" | "GLB";
type ImportFileType = SceneFileType | "Figma";

let activeTextureCache: TextureUrlCache | null = null;

function getMaxMaterialIndex(geometry: BufferGeometry): number {
  const groups = geometry.groups;
  if (!groups.length) return 0;
  return Math.max(...groups.map((g) => g.materialIndex ?? 0));
}

/**
 * FBX/GLTF: один material на mesh, но geometry.groups с materialIndex 0..N.
 * Без массива нужной длины второй слот рендерится чёрным.
 */
function resolveMeshMaterialSlots(mesh: Mesh): ThreeMaterial[] {
  const required = getMaxMaterialIndex(mesh.geometry) + 1;

  let mats: ThreeMaterial[];
  if (Array.isArray(mesh.material)) {
    mats = [...mesh.material];
  } else {
    mats = [mesh.material];
  }

  if (mats.length === 1 && required > 1) {
    mats = Array.from({ length: required }, () => mats[0]);
  }

  const fallback = mats[0] ?? new MeshPhongMaterial({ color: 0xcccccc });

  while (mats.length < required) {
    mats.push(mats[mats.length - 1] ?? fallback);
  }

  for (let i = 0; i < required; i++) {
    if (!mats[i]) {
      mats[i] = fallback.clone();
    }
  }

  return mats.slice(0, required);
}

function buildDomainMaterialFromThree(
  m: ThreeMaterial,
  textures: Material["textures"]
): Material {
  const std = m as MeshStandardMaterial;
  const color =
    std.color instanceof Color ? `#${std.color.getHexString()}` : "#cccccc";
  const emissive =
    std.emissive instanceof Color
      ? `#${std.emissive.getHexString()}`
      : "#000000";

  const hasBaseMap = textures[TextureSlot.BaseColor]?.url != null;
  const hasEmissiveMap = textures[TextureSlot.Emissive]?.url != null;

  return {
    id: m.uuid,
    baseColor: hasBaseMap ? "#ffffff" : color,
    roughness: typeof std.roughness === "number" ? std.roughness : 1,
    metalness: typeof std.metalness === "number" ? std.metalness : 0,
    emissive: hasEmissiveMap ? "#ffffff" : emissive,
    emissiveIntensity:
      typeof std.emissiveIntensity === "number" ? std.emissiveIntensity : 1,
    textures,
    name: std.name,
  };
}

function extractDomainMaterialFromThreeSync(
  m: ThreeMaterial,
  cache: TextureUrlCache
): Material {
  const textures = extractTexturesFromThreeMaterial(m, cache);
  return buildDomainMaterialFromThree(m, textures);
}

async function extractDomainMaterialFromThreeAsync(
  m: ThreeMaterial,
  cache: TextureUrlCache
): Promise<Material> {
  const textures = await extractTexturesFromThreeMaterialAsync(m, cache);
  return buildDomainMaterialFromThree(m, textures);
}

function basenameLower(name: string): string {
  const parts = name.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1]!.toLowerCase();
}

/** Дождаться async-текстур TextureLoader (FBX / OBJ+MTL) без polling. */
async function parseWithLoadingManager<T>(
  manager: LoadingManager,
  parse: () => T
): Promise<T> {
  let itemsStarted = 0;
  let loadCompleted = false;

  const originalStart = manager.itemStart.bind(manager);
  manager.itemStart = (url: string) => {
    itemsStarted++;
    originalStart(url);
  };

  const previousOnLoad = manager.onLoad;
  manager.onLoad = () => {
    loadCompleted = true;
    previousOnLoad?.();
  };

  const result = parse();

  if (itemsStarted === 0 || loadCompleted) {
    return result;
  }

  await new Promise<void>((resolve, reject) => {
    manager.onLoad = () => {
      previousOnLoad?.();
      resolve();
    };
    const previousOnError = manager.onError;
    manager.onError = (url) => {
      previousOnError?.(url);
      reject(new Error(`Failed to load texture: ${url}`));
    };
  });

  return result;
}

function createLoadingManager(
  resources: SceneImportResources | undefined,
  cache: TextureUrlCache
): LoadingManager {
  const manager = new LoadingManager();
  const urlByBasename = new Map<string, string>();

  if (resources?.textureFiles) {
    for (const [name, buffer] of Object.entries(resources.textureFiles)) {
      const url = URL.createObjectURL(new Blob([buffer]));
      cache.registerOwnedBlobUrl(url);
      urlByBasename.set(basenameLower(name), url);
    }

    manager.setURLModifier((url) => {
      const base = basenameLower(url);
      return urlByBasename.get(base) ?? url;
    });
  }

  return manager;
}

function parseObjGroup(
  objText: string,
  resources: SceneImportResources | undefined,
  manager: LoadingManager
): Object3D {
  const loader = new OBJLoader(manager);

  if (resources?.mtlText) {
    const mtlLoader = new MTLLoader(manager);
    mtlLoader.setMaterialOptions({
      normalizeRGB: true,
      ignoreZeroRGBs: true,
    });
    const materials = mtlLoader.parse(resources.mtlText, "");
    materials.preload();
    loader.setMaterials(materials);
  }

  return loader.parse(objText);
}

/**
 * Обход графа Three: каждый Mesh → SceneObject (плоский).
 * Геометрия — в threeAssetRegistry; материалы и URL текстур — в scene.materials.
 */
async function buildDomainSceneFromThreeRoot(
  threeRoot: Object3D,
  cache: TextureUrlCache,
  options: { syncTextures: boolean }
): Promise<Scene> {
  const meshes: SceneMesh[] = [];
  const materials: Record<string, Material> = {};

  threeRoot.updateMatrixWorld(true);

  const worldPos = new Vector3();
  const worldQuat = new Quaternion();
  const worldScale = new Vector3();
  const worldEuler = new Euler();

  type PendingMesh = {
    id: string;
    node: Mesh;
    threeMats: ThreeMaterial[];
    transform: SceneMesh["transform"];
    name: string;
    visible: boolean;
  };
  const pending: PendingMesh[] = [];

  threeRoot.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    node.matrixWorld.decompose(worldPos, worldQuat, worldScale);
    worldEuler.setFromQuaternion(worldQuat);

    pending.push({
      id: node.uuid,
      node,
      threeMats: resolveMeshMaterialSlots(node),
      name: node.name || "Mesh",
      visible: node.visible,
      transform: {
        position: [worldPos.x, worldPos.y, worldPos.z],
        rotation: [worldEuler.x, worldEuler.y, worldEuler.z],
        scale: [worldScale.x, worldScale.y, worldScale.z],
      },
    });
  });

  const uniqueThreeMats = new Map<string, ThreeMaterial>();
  for (const entry of pending) {
    for (const m of entry.threeMats) {
      uniqueThreeMats.set(m.uuid, m);
    }
  }

  if (options.syncTextures) {
    for (const m of uniqueThreeMats.values()) {
      materials[m.uuid] = extractDomainMaterialFromThreeSync(m, cache);
    }
  } else {
    await Promise.all(
      [...uniqueThreeMats.values()].map(async (m) => {
        materials[m.uuid] = await extractDomainMaterialFromThreeAsync(m, cache);
      })
    );
  }

  for (const entry of pending) {
    const domainMats = entry.threeMats.map((m) => m.uuid);

    threeAssetRegistry.register(entry.id, {
      geometry: entry.node.geometry,
    });

    meshes.push({
      id: entry.id,
      name: entry.name,
      visible: entry.visible,
      locked: false,
      pendingDelete: false,
      transform: entry.transform,
      materialIDs: domainMats,
    });
  }

  return {
    id: randomUUID(),
    meshes,
    materials,
    lights: withDefaultAmbientLight([]),
    camera: { ...DEFAULT_CAMERA_STATE },
    environment: { backgroundColor: null, shadowsEnabled: false },
  };
}

function beginSceneImport(): TextureUrlCache {
  threeAssetRegistry.clear();
  textureGpuPool.clear();
  activeTextureCache?.dispose();
  activeTextureCache = new TextureUrlCache();
  return activeTextureCache;
}

async function threeObjectToDomainScene(
  root: Object3D | GLTF,
  options: { syncTextures: boolean }
): Promise<Scene> {
  const cache = beginSceneImport();
  const threeRoot = "scene" in root ? root.scene : root;
  return buildDomainSceneFromThreeRoot(threeRoot, cache, options);
}

export class SceneEncoder {
  async export(
    type: SceneFileType,
    scene: Scene,
    options?: SceneExportOptions
  ): Promise<ArrayBuffer> {
    if (type !== "GLB") {
      throw new Error("SceneEncoder.export: only GLB is supported");
    }

    const built = await buildThreeSceneFromDomain(scene, {
      includeCamera: options?.includeCamera ?? false,
    });

    try {
      const glb = await new GLTFExporter().parseAsync(built.root, {
        binary: true,
        embedImages: !(options?.includeTextures ?? false),
      });
      return glb as ArrayBuffer;
    } finally {
      built.dispose();
    }
  }

  async import(
    type: ImportFileType,
    raw: ArrayBuffer | string,
    resources?: SceneImportResources
  ): Promise<Scene> {
    switch (type) {
      case "OBJ": {
        const text =
          typeof raw === "string" ? raw : new TextDecoder().decode(raw);
        const cache = beginSceneImport();
        const manager = createLoadingManager(resources, cache);
        const group = await parseWithLoadingManager(manager, () =>
          parseObjGroup(text, resources, manager)
        );
        return buildDomainSceneFromThreeRoot(group, cache, {
          syncTextures: true,
        });
      }
      case "FBX": {
        const buffer =
          raw instanceof ArrayBuffer
            ? raw
            : Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer;
        const cache = beginSceneImport();
        const manager = new LoadingManager();
        const group = await parseWithLoadingManager(manager, () => {
          const loader = new FBXLoader(manager);
          return loader.parse(buffer, "");
        });
        return buildDomainSceneFromThreeRoot(group, cache, {
          syncTextures: true,
        });
      }
      case "GLB": {
        const buffer =
          raw instanceof ArrayBuffer
            ? raw
            : Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer;
        const loader = new GLTFLoader();
        const gltf = await loader.parseAsync(buffer, "");
        return threeObjectToDomainScene(gltf, { syncTextures: false });
      }
      case "Figma":
        throw new Error("SceneEncoder.import: Figma is not implemented");
    }
  }
}

export { hasAnyTextureUrl };
