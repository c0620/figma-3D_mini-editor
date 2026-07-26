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
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import { randomUUID } from "../lib/randomId";
import type {
  Material,
  MaterialID,
  ObjectID,
  Scene,
  SceneCamera,
  SceneGraph,
  SceneGroup,
  SceneLight,
  SceneMesh,
  SceneObject,
} from "../types/scene";
import { CameraType, TextureSlot } from "../types/scene";
import { threeAssetRegistry } from "../store/threeAssetRegistry";

type SceneFileType = "OBJ" | "FBX" | "GLB";
type ImportFileType = SceneFileType | "Figma";

export enum IDs {
  PluginCamera = "plugin-camera-id",
}

/**
 * Обход графа Three: каждый Mesh → SceneObject (плоский), геометрия и материал
 * уходят в threeAssetRegistry под тем же id. Сама Three-структура остаётся
 * вне стора.
 */

function parseObjectThree(
  node: Object3D,
  parentID: ObjectID | null,
  objectThree: SceneGraph["graphThree"],
  sceneObjects: SceneGraph["objects"],
  hasLight: boolean
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
  if (node instanceof PerspectiveCamera || node instanceof OrthographicCamera) {
    sceneObjects[id] = {
      id,
      kind: "Camera",
      type:
        node instanceof PerspectiveCamera
          ? CameraType.Perspective
          : CameraType.Orthographic,
      zoom: node.zoom,
      transform: transform,
      locked: false,
      name: node.name,
      pendingDelete: false,
      parentId: parentID,
      dolly: 1,
    } as SceneCamera;
  } else if (node instanceof Mesh) {
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
    hasLight = true;
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
  if (parentID) {
    if (parentID in objectThree) {
      objectThree[parentID]!.push(id);
    } else {
      objectThree[parentID] = [id];
    }
  }
  node.children.forEach((c) =>
    parseObjectThree(c, id, objectThree, sceneObjects, hasLight)
  );
}

function threeObjectToDomainScene(root: Object3D | GLTF): Scene {
  threeAssetRegistry.clear();

  const threeRoot = "scene" in root ? root.scene : root;
  const graphThree: SceneGraph["graphThree"] = {};
  const sceneObjects: SceneGraph["objects"] = {};

  threeRoot.updateMatrixWorld(true);

  var parent: Object3D = threeRoot;
  let hasLight = false;

  parseObjectThree(threeRoot, null, graphThree, sceneObjects, hasLight);

  const materials: Record<MaterialID, Material> = {};

  Object.entries(threeAssetRegistry.materials).map(([id, m]) => {
    if (m.material.emissive?.equals(new Color(0x000000))) {
      m.material.emissiveIntensity = 0;
    }
    materials[id] = {
      id,
      name: m.material.name,
      color: { type: "custom", value: m.material.color.clone() },
      roughness: m.material.roughness,
      metalness: m.material.metalness,
      emissiveIntensity: m.material.emissive?.equals(new Color(0x000000))
        ? 0
        : m.material.emissiveIntensity,
      textures: {
        emissiveMap: m.material.emissiveMap?.image,
        map: m.material.map?.image,
        metalnessMap: m.material.metalnessMap?.image,
        normalMap: m.material.normalMap?.image,
        roughnessMap: m.material.roughnessMap?.image,
      },
    };
  });

  let pluginCamera = {
    name: "Plugin Camera",
    kind: "Camera",
    id: IDs.PluginCamera,
    type: CameraType.Perspective,
    zoom: 1,
    locked: false,
    pendingDelete: false,
    parentId: null,
    transform: {
      position: [0, 0, 5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    near: 0.1,
    far: 2000,
    fov: 50,
    aspect: [1, 1],
    dolly: 1,
    azimuth: 0,
    polar: Math.PI / 2,
  } as SceneCamera;

  if (!hasLight) {
    // var pluginAmbientLight: SceneLight = {};
    // var pluginSpotLight: SceneLight = {};
  }
  return {
    id: randomUUID(),
    sceneGraph: {
      objects: { ...sceneObjects, [pluginCamera.id]: pluginCamera },
      graphThree,
      roots: [threeRoot.uuid, pluginCamera.id],
    },
    materials,
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
