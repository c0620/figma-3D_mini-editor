import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Mesh,
  MeshStandardMaterial,
  Color,
  Object3D,
  Vector3,
  Quaternion,
  Euler,
  type Material as ThreeMaterial,
  Group,
  Light,
  DirectionalLight,
  SpotLight,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import { randomUUID } from "../lib/randomId";
import type {
  Material,
  MaterialID,
  Scene,
  SceneGraph,
  SceneGroup,
  SceneLight,
  SceneMesh,
  SceneObject,
} from "../types/scene";
import { TextureSlot } from "../types/scene";
import { threeAssetRegistry } from "../store/threeAssetRegistry";

type SceneFileType = "OBJ" | "FBX" | "GLB";
type ImportFileType = SceneFileType | "Figma";

/**
 * Обход графа Three: каждый Mesh → SceneObject (плоский), геометрия и материал
 * уходят в threeAssetRegistry под тем же id. Сама Three-структура остаётся
 * вне стора.
 */

function parseObjectThree(
  node: Object3D,
  parentID: string,
  objectThree: SceneGraph["graphThree"],
  sceneObjects: SceneGraph["objects"]
) {
  // const worldPos = new Vector3();
  // const worldQuat = new Quaternion();
  // const worldScale = new Vector3();
  // const worldEuler = new Euler();

  // node.matrixWorld.decompose(worldPos, worldQuat, worldScale);
  // worldEuler.setFromQuaternion(worldQuat);

  const transform = {
    position: node.position.toArray() as [number, number, number],
    rotation: [node.rotation.x, node.rotation.y, node.rotation.z] as [
      number,
      number,
      number,
    ],
    scale: node.scale.toArray() as [number, number, number],
  };

  const id = node.uuid;

  if (node instanceof Mesh) {
    threeAssetRegistry.register(id, {
      geometry: node.geometry,
      materials: node.material,
    });
    objectThree[id] = [];

    sceneObjects[id] = {
      id: id,
      parentId: parentID,
      kind: "Mesh",
      transform,
      visible: node.visible,
      locked: false,
      pendingDelete: false,
      name: node.name,
      materials: Array.isArray(node.material)
        ? node.material.map((m) => m.uuid)
        : [node.material.uuid],
    } as SceneMesh;
  } else if (node instanceof Light) {
    const type = node instanceof SpotLight ? "Spot" : "Ambient";
    sceneObjects[id] = {
      id: id,
      parentId: parentID,
      kind: "Light",
      type: type,
      color: node.color.getHexString(),
      intensity: node.intensity,
      transform: transform,
      visible: node.visible,
      locked: false,
      name: node.name,
      pendingDelete: false,
    } as SceneLight;
  } else if (node instanceof Group || node instanceof Object3D) {
    sceneObjects[id] = {
      id: id,
      parentId: parentID,
      kind: "Group",
      transform: transform,
      visible: node.visible,
      locked: false,
      name: node.name,
      pendingDelete: false,
    } as SceneGroup;
  }
  if (parentID !== id) {
    if (parentID in objectThree) {
      objectThree[parentID]!.push(id);
    } else {
      objectThree[parentID] = [id];
    }
  }
  node.children.forEach((c) =>
    parseObjectThree(c, id, objectThree, sceneObjects)
  );
}

function threeObjectToDomainScene(root: Object3D | GLTF): Scene {
  threeAssetRegistry.clear();

  const threeRoot = "scene" in root ? root.scene : root;
  const graphThree: SceneGraph["graphThree"] = {};
  const sceneObjects: SceneGraph["objects"] = {};

  threeRoot.updateMatrixWorld(true);

  var parent: Object3D = threeRoot;

  parseObjectThree(threeRoot, parent.uuid, graphThree, sceneObjects);

  const materials: Record<MaterialID, Material> = {};

  Object.entries(threeAssetRegistry.materials).map(
    ([id, m]) =>
      (materials[id] = {
        id,
        name: m.material.name,
        baseColor: m.material.color.getHexString(),
        roughness: m.material.roughness,
        metalness: m.material.metalness,
        emissiveIntensity: m.material.emissiveIntensity,
        textures: {
          emissiveMap: m.material.emissiveMap?.image,
          map: m.material.map?.image,
          metalnessMap: m.material.metalnessMap?.image,
          normalMap: m.material.normalMap?.image,
          roughnessMap: m.material.roughnessMap?.image,
        },
      })
  );

  return {
    id: randomUUID(),
    sceneGraph: {
      objects: sceneObjects,
      graphThree,
      roots: [threeRoot.uuid],
    },
    materials,
    cameras: {
      "1": {
        name: "Camera-1",
        kind: "Camera",
        id: "1",
        type: "Perspective",
        zoom: 1,
        locked: false,
        pendingDelete: false,
        parentId: null,
        transform: {
          position: [0, 0, 5],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      },
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
