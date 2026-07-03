import {
  TextureSlot,
  type TextureMiniature,
} from "../types/scene";
import { CommandType, type HistoryEntry } from "@/types/commands";
import { SceneToolHandler } from "./sceneToolHandler";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import { TextureLocalService } from "@/io/textureLocalService";
import { TextureFigmaService } from "@/io/textureFigmaService";
import type { Texture } from "three";
import { SceneStorage } from "@/store/sceneStorage";

export type TextureImportPayload =
  | {
      materialId: string;
      slot: TextureSlot;
      source: "local";
      file: File;
    }
  | {
      materialId: string;
      slot: TextureSlot;
      source: "figma";
      frameId: string;
    }
  | {
      materialId: string;
      slot: TextureSlot;
      texture: Texture | null;
      textureImage: TextureMiniature | null;
    };

export type TextureImportSnapshot = {
  materialId: string;
  slot: TextureSlot;
  texture: Texture | null;
  textureImage: TextureMiniature | null;
};

export class TextureImportHandler extends SceneToolHandler<
  TextureImportPayload,
  TextureImportSnapshot
> {
  local: TextureLocalService;
  figma: TextureFigmaService;

  constructor(
    scene: SceneStorage,
    local: TextureLocalService,
    figma: TextureFigmaService
  ) {
    super(scene);
    this.local = local;
    this.figma = figma;
  }

  execute(payload: TextureImportPayload): void {
    if ("file" in payload && payload.file) {
      void this.local
        .loadTextureFromFile(payload.file, payload.slot)
        .then((texture) =>
          this.applyTexture(payload.materialId, payload.slot, texture)
        );
      return;
    }

    if ("frameId" in payload && payload.source === "figma") {
      this.figma.importTextureFromFrame(
        payload.frameId,
        payload.materialId,
        payload.slot
      );
      return;
    }

    if ("texture" in payload) {
      this.applyTexture(
        payload.materialId,
        payload.slot,
        payload.texture,
        payload.textureImage
      );
    }
  }

  getStateBeforeExecute(
    payload: TextureImportPayload
  ): HistoryEntry<TextureImportSnapshot> {
    const material = this.scene.getMaterial(payload.materialId);
    const threeMat = threeAssetRegistry.materials[payload.materialId].material;
    return {
      type: CommandType.ImportTexture,
      snapshot: {
        materialId: payload.materialId,
        slot: payload.slot,
        texture: threeMat[payload.slot] ?? null,
        textureImage: material?.textures[payload.slot] ?? null,
      },
    };
  }

  private applyTexture(
    materialId: string,
    slot: TextureSlot,
    texture: Texture | null,
    textureImage?: TextureMiniature | null
  ): void {
    const material = this.scene.getMaterial(materialId);
    if (!material) return;

    if (texture) threeAssetRegistry.setTexture(materialId, slot, texture);
    else {
      threeAssetRegistry.materials[materialId].material[slot]?.dispose();
      threeAssetRegistry.materials[materialId].material[slot] = null;
      threeAssetRegistry.materials[materialId].material.needsUpdate = true;
    }

    this.scene.patchMaterial(materialId, {
      textures: {
        ...material.textures,
        [slot]: textureImage ?? texture?.image ?? null,
      },
    });
  }
}
