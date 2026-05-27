import { captureTransformSnapshot } from "../lib/transformSnapshot";
import type {
  TransformObjectInversePayload,
  TransformObjectPayload,
} from "../handlers/baseToolHandler";
import type { SceneEntityKind } from "@/store/sceneEntityList";
import { createDefaultLight } from "../lights/lightDefaults";
import type {
  CameraPatch,
  LightPatch,
  MaterialPatch,
} from "../store/sceneStore";
import { SceneStorage } from "../store/sceneStorage";
import { CommandType } from "../types/commands";
import type { Light, Material, TextureSlot, Transform } from "../types/scene";

export class HistoryInverseBuilder {
  scene: SceneStorage;

  constructor(scene: SceneStorage) {
    this.scene = scene;
  }

  build(type: CommandType, payload: object): object {
    switch (type) {
      case CommandType.AddLight:
        return this.inverseAddLight(payload);
      case CommandType.DeleteModel:
        return this.inverseDeleteModel(payload);
      case CommandType.ToggleVisibility:
      case CommandType.ToggleLock:
        return payload;
      case CommandType.EditLight:
        return this.inverseEditLight(payload);
      case CommandType.EditMaterial:
        return this.inverseEditMaterial(payload);
      case CommandType.EditCamera:
        return this.inverseEditCamera(payload);
      case CommandType.SetBackground:
        return this.inverseSetBackground(payload);
      case CommandType.ToggleShadows:
        return this.inverseToggleShadows(payload);
      case CommandType.ImportTexture:
        return this.inverseImportTexture(payload);
      case CommandType.ExportTexture:
        return {};
      case CommandType.TransformObject:
        return this.inverseTransformObject(payload);
      default:
        return {};
    }
  }

  private inverseTransformObject(payload: object): TransformObjectInversePayload {
    const { id } = payload as TransformObjectPayload;
    return (
      captureTransformSnapshot(this.scene, id) ?? {
        id,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }
    );
  }

  private inverseAddLight(payload: object): { id: string } {
    const light = createDefaultLight(payload as Partial<Light>);
    return { id: light.id };
  }

  private inverseDeleteModel(payload: object): object {
    const { modelId, type } = payload as {
      modelId: string;
      type?: Exclude<SceneEntityKind, "camera">;
    };

    const light = this.scene.findLightById(modelId);
    if (light || type === "light") {
      const entity = light ?? this.scene.findLightById(modelId);
      if (!entity) return {};
      return {
        modelId,
        type: "light" as const,
        visible: entity.visible,
        pendingDelete: entity.pendingDelete,
      };
    }

    const mesh = this.scene.findMeshById(modelId);
    if (mesh || type === "mesh") {
      const entity = mesh ?? this.scene.findMeshById(modelId);
      if (!entity) return {};
      return {
        modelId,
        type: "mesh" as const,
        visible: entity.visible,
        pendingDelete: entity.pendingDelete,
      };
    }

    return {};
  }

  private inverseEditLight(payload: object): { id: string; changes: LightPatch } {
    const { id, changes } = payload as { id: string; changes: LightPatch };
    const light = this.scene.findLightById(id);
    if (!light) return { id, changes: {} };

    return { id, changes: this.pickLightPatchInverse(light, changes) };
  }

  private pickLightPatchInverse(
    light: Light,
    changes: LightPatch
  ): LightPatch {
    const inverse: LightPatch = {};

    if (changes.transform) {
      inverse.transform = {};
      for (const key of Object.keys(changes.transform) as (keyof Transform)[]) {
        inverse.transform[key] = light.transform[key];
      }
    }

    for (const key of Object.keys(changes) as (keyof LightPatch)[]) {
      if (key === "transform") continue;
      inverse[key] = light[key as keyof Light] as never;
    }

    return inverse;
  }

  private inverseEditMaterial(payload: object): {
    id: string;
    changes: MaterialPatch;
  } {
    const { id, changes } = payload as {
      id: string;
      changes: MaterialPatch;
    };
    const material = this.scene.getScene().materials[id];
    if (!material) return { id, changes: {} };

    return { id, changes: this.pickMaterialPatchInverse(material, changes) };
  }

  private pickMaterialPatchInverse(
    material: Material,
    changes: MaterialPatch
  ): MaterialPatch {
    const inverse: MaterialPatch = {};

    if (changes.textures) {
      inverse.textures = {};
      for (const slot of Object.keys(changes.textures) as TextureSlot[]) {
        inverse.textures[slot] = material.textures[slot];
      }
    }

    const scalarKeys = [
      "baseColor",
      "roughness",
      "metalness",
      "emissive",
      "emissiveIntensity",
    ] as const;

    for (const key of scalarKeys) {
      if (key in changes) {
        switch (key) {
          case "baseColor":
            inverse.baseColor = material.baseColor;
            break;
          case "roughness":
            inverse.roughness = material.roughness;
            break;
          case "metalness":
            inverse.metalness = material.metalness;
            break;
          case "emissive":
            inverse.emissive = material.emissive;
            break;
          case "emissiveIntensity":
            inverse.emissiveIntensity = material.emissiveIntensity;
            break;
        }
      }
    }

    return inverse;
  }

  private inverseEditCamera(payload: object): CameraPatch {
    const patch = payload as CameraPatch;
    const camera = this.scene.getCamera();
    if (!camera) return {};

    const inverse: CameraPatch = {};

    if (patch.transform) {
      inverse.transform = {};
      for (const key of Object.keys(patch.transform) as (keyof Transform)[]) {
        inverse.transform[key] = camera.transform[key];
      }
    }

    const cameraKeys = [
      "type",
      "near",
      "far",
      "aspect",
      "aspectPreviewEnabled",
      "fov",
      "perspectiveZoom",
      "orthographicZoom",
      "orbitTarget",
      "locked",
      "savedView",
    ] as const;

    for (const key of cameraKeys) {
      if (key in patch) {
        inverse[key] = camera[key as keyof typeof camera] as never;
      }
    }

    return inverse;
  }

  private inverseSetBackground(_payload: object): object {
    const env = this.scene.getScene().environment;
    return { backgroundColor: env.backgroundColor };
  }

  private inverseToggleShadows(_payload: object): object {
    const env = this.scene.getScene().environment;
    return { shadowsEnabled: env.shadowsEnabled };
  }

  private inverseImportTexture(payload: object): object {
    const { materialId, slot } = payload as {
      materialId: string;
      slot: TextureSlot;
    };
    const material = this.scene.getScene().materials[materialId];
    const previousTexture = material?.textures[slot] ?? null;
    return {
      materialId,
      slot,
      previousTexture: previousTexture ? { ...previousTexture } : null,
    };
  }
}
