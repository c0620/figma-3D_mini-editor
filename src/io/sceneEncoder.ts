import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Mesh,
  MeshStandardMaterial,
  Color,
  Vector3,
  Quaternion,
  Euler,
  type Material as ThreeMaterial,
  type Object3D,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import { randomUUID } from "../lib/randomId";
import type { Material, Scene, SceneObject } from "../types/scene";
import { TextureSlot } from "../types/scene";
import { threeAssetRegistry } from "./threeAssetRegistry";

type SceneFileType = "OBJ" | "FBX" | "GLB";
type ImportFileType = SceneFileType | "Figma";

function extractDomainMaterial(
  threeMat: ThreeMaterial | ThreeMaterial[]
): Material {
  const m = Array.isArray(threeMat) ? threeMat[0] : threeMat;
  const std = m as MeshStandardMaterial;
  const color =
    std.color instanceof Color ? `#${std.color.getHexString()}` : "#cccccc";
  const emissive =
    std.emissive instanceof Color
      ? `#${std.emissive.getHexString()}`
      : "#000000";

  return {
    id: m.uuid,
    baseColor: color,
    roughness: typeof std.roughness === "number" ? std.roughness : 1,
    metalness: typeof std.metalness === "number" ? std.metalness : 0,
    emissive,
    textures: {
      [TextureSlot.BaseColor]: null,
      [TextureSlot.Normal]: null,
      [TextureSlot.Roughness]: null,
      [TextureSlot.Metalness]: null,
      [TextureSlot.Emissive]: null,
    },
  };
}

/**
 * Обход графа Three: каждый Mesh → SceneObject (плоский), геометрия и материал
 * уходят в threeAssetRegistry под тем же id. Сама Three-структура остаётся
 * вне стора.
 */
function threeObjectToDomainScene(root: Object3D | GLTF): Scene {
  threeAssetRegistry.clear();

  const threeRoot = "scene" in root ? root.scene : root;
  const objects: SceneObject[] = [];
  const materials: Record<string, Material> = {};

  threeRoot.updateMatrixWorld(true);

  const worldPos = new Vector3();
  const worldQuat = new Quaternion();
  const worldScale = new Vector3();
  const worldEuler = new Euler();

  threeRoot.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    node.matrixWorld.decompose(worldPos, worldQuat, worldScale);
    worldEuler.setFromQuaternion(worldQuat);

    const id = node.uuid;
    const threeMat = node.material as ThreeMaterial | ThreeMaterial[];
    const domainMat = extractDomainMaterial(threeMat);
    materials[domainMat.id] = domainMat;

    threeAssetRegistry.register(id, {
      geometry: node.geometry,
      material: threeMat,
    });

    objects.push({
      id,
      name: node.name || "Mesh",
      visible: node.visible,
      locked: false,
      pendingDelete: false,
      transform: {
        position: [worldPos.x, worldPos.y, worldPos.z],
        rotation: [worldEuler.x, worldEuler.y, worldEuler.z],
        scale: [worldScale.x, worldScale.y, worldScale.z],
      },
      materialId: domainMat.id,
    });
  });

  return {
    id: randomUUID(),
    objects,
    materials,
    lights: [],
    camera: {
      type: "Perspective",
      zoom: 1,
      position: [0, 0, 5],
      target: [0, 0, 0],
    },
    environment: { backgroundColor: null, shadowsEnabled: false },
  };
}

export class SceneEncoder {
  export(type: SceneFileType, scene: Scene): string {
    // TODO: сериализация доменной сцены в нужный формат
    void type;
    void scene;
    return "";
  }

  async import(
    type: ImportFileType,
    raw: ArrayBuffer | string
  ): Promise<Scene> {
    switch (type) {
      case "OBJ": {
        const text =
          typeof raw === "string" ? raw : new TextDecoder().decode(raw);
        const loader = new OBJLoader();
        const group = loader.parse(text);
        return threeObjectToDomainScene(group);
      }
      case "FBX": {
        const buffer =
          raw instanceof ArrayBuffer
            ? raw
            : Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer;
        const loader = new FBXLoader();
        const group = loader.parse(buffer, "");
        return threeObjectToDomainScene(group);
      }
      case "GLB": {
        const buffer =
          raw instanceof ArrayBuffer
            ? raw
            : Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer;
        const loader = new GLTFLoader();
        const gltf = await loader.parseAsync(buffer, "");
        return threeObjectToDomainScene(gltf);
      }
      case "Figma":
        throw new Error("SceneEncoder.import: Figma is not implemented");
    }
  }
}
