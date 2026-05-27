import {
  applyTransformPayload,
  type TransformObjectInversePayload,
} from "../handlers/baseToolHandler";
import { useSceneStore } from "../store/sceneStore";
import type {
  CameraPatch,
  LightPatch,
  MaterialPatch,
} from "../store/sceneStore";
import { SceneStorage } from "../store/sceneStorage";
import { CommandType } from "../types/commands";
import type { StoredTexture, TextureSlot } from "../types/scene";
import type { SceneEntityKind } from "@/store/sceneEntityList";
import { textureGpuPool } from "../store/textureGpuPool";
import { ActionExecutor } from "./actionExecutor";

export class ActionReverter {
  scene: SceneStorage;
  executor: ActionExecutor;

  constructor(scene: SceneStorage, executor: ActionExecutor) {
    this.scene = scene;
    this.executor = executor;
  }

  revert(type: CommandType, inversePayload: object): void {
    switch (type) {
      case CommandType.AddLight:
        this.revertAddLight(inversePayload as { id: string });
        break;
      case CommandType.DeleteModel:
        this.revertDeleteModel(
          inversePayload as {
            modelId: string;
            type: Exclude<SceneEntityKind, "camera">;
            visible: boolean;
            pendingDelete: boolean;
          }
        );
        break;
      case CommandType.ToggleVisibility:
      case CommandType.ToggleLock:
        this.executor.run(type, inversePayload);
        break;
      case CommandType.EditLight:
        this.revertEditLight(
          inversePayload as { id: string; changes: LightPatch }
        );
        break;
      case CommandType.EditMaterial:
        this.revertEditMaterial(
          inversePayload as { id: string; changes: MaterialPatch }
        );
        break;
      case CommandType.EditCamera:
        this.scene.patchCamera(inversePayload as CameraPatch);
        break;
      case CommandType.SetBackground:
      case CommandType.ToggleShadows:
        this.patchEnvironment(inversePayload);
        break;
      case CommandType.ImportTexture:
        this.revertImportTexture(
          inversePayload as {
            materialId: string;
            slot: TextureSlot;
            previousTexture: StoredTexture | null;
          }
        );
        break;
      case CommandType.ExportTexture:
        break;
      case CommandType.TransformObject:
        this.revertTransformObject(inversePayload as TransformObjectInversePayload);
        break;
      default:
        break;
    }
  }

  private revertTransformObject(inverse: TransformObjectInversePayload): void {
    applyTransformPayload(
      this.scene,
      {
        id: inverse.id,
        position: inverse.position,
        rotation: inverse.rotation,
        scale: inverse.scale,
      },
      {
        target: inverse.target,
        orbitTarget: inverse.orbitTarget,
      }
    );
  }

  private revertAddLight({ id }: { id: string }): void {
    if (!id) return;
    this.scene.removeLight(id);
  }

  private revertDeleteModel({
    modelId,
    type,
    visible,
    pendingDelete,
  }: {
    modelId: string;
    type: Exclude<SceneEntityKind, "camera">;
    visible: boolean;
    pendingDelete: boolean;
  }): void {
    if (type === "light") {
      this.scene.patchLight(modelId, { visible, pendingDelete });
      return;
    }

    this.scene.patchSceneMesh(modelId, { visible, pendingDelete });
  }

  private revertEditLight({
    id,
    changes,
  }: {
    id: string;
    changes: LightPatch;
  }): void {
    if (Object.keys(changes).length === 0) return;
    this.scene.patchLight(id, changes);
  }

  private revertEditMaterial({
    id,
    changes,
  }: {
    id: string;
    changes: MaterialPatch;
  }): void {
    if (Object.keys(changes).length === 0) return;
    this.scene.patchMaterial(id, changes);
  }

  private revertImportTexture({
    materialId,
    slot,
    previousTexture,
  }: {
    materialId: string;
    slot: TextureSlot;
    previousTexture: StoredTexture | null;
  }): void {
    const material = this.scene.getScene().materials[materialId];
    if (!material) return;

    const currentUrl = material.textures[slot]?.url;
    if (currentUrl) textureGpuPool.evict(currentUrl);

    this.scene.patchMaterial(materialId, {
      textures: {
        [slot]: previousTexture ? { ...previousTexture } : null,
      },
    });
  }

  private patchEnvironment(patch: object): void {
    useSceneStore.setState((state) => {
      if (!state.scene) return state;
      return {
        scene: {
          ...state.scene,
          environment: { ...state.scene.environment, ...patch },
        },
      };
    });
  }
}
