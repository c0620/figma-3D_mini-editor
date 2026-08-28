import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Mesh,
  Color,
  Object3D,
  Vector3,
  Spherical,
  Group,
  Light,
  SpotLight,
  PerspectiveCamera,
  OrthographicCamera,
  PointLight,
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
} from "../types/scene";
import { CameraType, LightType } from "../types/scene";
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import type { UploadAction } from "./sceneTransferFacade";

type SceneFileType = "OBJ" | "FBX" | "GLB";
type ImportFileType = SceneFileType | "Figma";
type SceneProperties = {
  hasLight: boolean;
  hasCamera: boolean;
};

export enum IDs {
  PluginCamera = "plugin-camera-id",
  PluginSpotLight = "plugin-spotlight-id",
  PluginAmbientLight = "plugin-ambientlight-id",
}

function cameraTargetFromThree(
  camera: PerspectiveCamera | OrthographicCamera,
  distance = 5
): [number, number, number] {
  camera.updateWorldMatrix(true, false);
  const origin = new Vector3();
  const target = new Vector3();
  camera.getWorldPosition(origin);
  camera.getWorldDirection(target);
  target.multiplyScalar(distance).add(origin);
  return target.toArray() as [number, number, number];
}

function parseObjectThree(
  node: Object3D,
  parentID: ObjectID | null,
  objectThree: SceneGraph["graphThree"],
  meshes: Scene["meshes"],
  lights: Scene["lights"],
  groups: Scene["groups"],
  cameras: Scene["cameras"],
  sceneProperties: SceneProperties
) {
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
    sceneProperties.hasCamera = true;
    const isPerspective = node instanceof PerspectiveCamera;
    const distance = 5;
    const target = cameraTargetFromThree(node, distance);
    const orbit = new Spherical().setFromVector3(
      new Vector3()
        .fromArray(transform.position)
        .sub(new Vector3().fromArray(target))
    );

    const camera: SceneCamera = {
      id,
      kind: "Camera",
      type: isPerspective ? CameraType.Perspective : CameraType.Orthographic,
      zoom: node.zoom,
      transform: transform,
      locked: false,
      name: node.name,
      pendingDelete: false,
      parentId: parentID,
      near: node.near,
      far: node.far,
      fov: isPerspective ? node.fov : 50,
      aspect: [1, 1],
      dolly: distance,
      azimuth: orbit.theta,
      polar: orbit.phi,
      target,
    };

    cameras[id] = camera;
  } else if (node instanceof Mesh) {
    threeAssetRegistry.register(id, {
      geometry: node.geometry,
      materials: node.material,
    });
    objectThree[id] = [];

    meshes[id] = {
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
    sceneProperties.hasLight = true;
    const type =
      node instanceof SpotLight
        ? LightType.Spot
        : node instanceof PointLight
          ? LightType.Point
          : LightType.Ambient;
    lights[id] = {
      id: id,
      parentId: parentID,
      kind: "Light",
      type: type,
      color: { type: "custom", value: node.color },
      intensity: node.intensity,
      transform: transform,
      visible: node.visible,
      locked: false,
      name: node.name,
      pendingDelete: false,
      distance:
        node instanceof SpotLight || node instanceof PointLight
          ? node.distance
          : 0,
      angle: node instanceof SpotLight ? node.angle : Math.PI / 3,
      penumbra: node instanceof SpotLight ? node.penumbra : 0,
      decay:
        node instanceof SpotLight || node instanceof PointLight
          ? node.decay
          : 2,
      target: null,
    } as SceneLight;
  } else if (node instanceof Group || node instanceof Object3D) {
    groups[id] = {
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
    parseObjectThree(
      c,
      id,
      objectThree,
      meshes,
      lights,
      groups,
      cameras,
      sceneProperties
    )
  );
}

function threeObjectToDomainScene(
  root: Object3D | GLTF,
  action: UploadAction
): Scene {
  if (action == "LoadScene") threeAssetRegistry.clear();

  const threeRoot = "scene" in root ? root.scene : root;
  const roots: SceneGraph["roots"] = [threeRoot.uuid];
  const graphThree: SceneGraph["graphThree"] = {};
  const meshes: Scene["meshes"] = {};
  const lights: Scene["lights"] = {};
  const groups: Scene["groups"] = {};
  const cameras: Scene["cameras"] = {};

  threeRoot.updateMatrixWorld(true);

  let sceneProperties: SceneProperties = { hasLight: false, hasCamera: false };

  parseObjectThree(
    threeRoot,
    null,
    graphThree,
    meshes,
    lights,
    groups,
    cameras,
    sceneProperties
  );

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

  if (action == "LoadScene") {
    let pluginCamera: SceneCamera = {
      name: "Plugin Camera",
      kind: "Camera",
      id: IDs.PluginCamera,
      type: CameraType.Perspective,
      zoom: null,
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
      dolly: null,
      azimuth: 0,
      polar: Math.PI / 2,
      target: [0, 0, 0],
    };
    cameras[pluginCamera.id] = pluginCamera;
    roots.push(pluginCamera.id);
  }

  if (!sceneProperties.hasLight && action == "LoadScene") {
    let pluginAmbientLight: SceneLight = {
      type: LightType.Ambient,
      color: { type: "custom", value: new Color().setColorName("white") },
      intensity: 1,
      kind: "Light",
      distance: 0,
      angle: Math.PI / 3,
      penumbra: 1,
      decay: 1,
      target: null,
      id: IDs.PluginAmbientLight,
      name: "Plugin Light",
      visible: true,
      locked: false,
      transform: { position: [0, 5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      pendingDelete: false,
      parentId: null,
    };
    let pluginSpotLight: SceneLight = {
      type: LightType.Spot,
      color: { type: "custom", value: new Color().setColorName("white") },
      intensity: 100,
      kind: "Light",
      distance: 0,
      angle: Math.PI / 3,
      penumbra: 1,
      decay: 1,
      target: null,
      id: IDs.PluginSpotLight,
      name: "Plugin Light",
      visible: true,
      locked: false,
      transform: { position: [5, 5, 5], rotation: [0, 0, 0], scale: [1, 1, 1] },
      pendingDelete: false,
      parentId: null,
    };

    lights[IDs.PluginAmbientLight] = pluginAmbientLight;
    lights[IDs.PluginSpotLight] = pluginSpotLight;

    roots.push(IDs.PluginAmbientLight);
    roots.push(IDs.PluginSpotLight);
  }
  return {
    id: threeRoot.uuid,
    meshes,
    lights,
    groups,
    sceneGraph: {
      graphThree,
      roots: roots,
    },
    materials,
    cameras: { ...cameras },
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
    raw: ArrayBuffer | string,
    action: UploadAction
  ): Promise<Scene> {
    switch (type) {
      case "OBJ": {
        const text =
          typeof raw === "string" ? raw : new TextDecoder().decode(raw);
        const loader = new OBJLoader();
        const group = loader.parse(text);
        return threeObjectToDomainScene(group, action);
      }
      case "FBX": {
        const buffer =
          raw instanceof ArrayBuffer
            ? raw
            : Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer;
        const loader = new FBXLoader();
        const group = loader.parse(buffer, "");
        return threeObjectToDomainScene(group, action);
      }
      case "GLB": {
        const buffer =
          raw instanceof ArrayBuffer
            ? raw
            : Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer;
        const loader = new GLTFLoader();
        const gltf = await loader.parseAsync(buffer, "");
        return threeObjectToDomainScene(gltf, action);
      }
      case "Figma":
        throw new Error("SceneEncoder.import: Figma is not implemented");
    }
  }
}
