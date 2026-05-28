import { base64ToUint8Array } from "@/lib/base64";
import {
  countScenePolygons,
  countSceneTextures,
  formatSceneDimensions,
} from "@/lib/sceneMeta";
import type { LinkedSelectionSummary } from "@/figma/figmaMessages";
import { Renderer } from "@/render/renderer";
import type {
  ImportFrameMeta,
  ImportPreviewData,
  ImportSceneMeta,
  ImportTexturePreview,
  PreparedDeviceImport,
  PreparedFigmaImport,
} from "@/types/import";
import { TextureSlot, type Scene } from "@/types/scene";
import type { SceneImportResources } from "./sceneImportExportService";
import { SceneEncoder } from "./sceneEncoder";
import { ScenePersistenceService } from "./scenePersistenceService";

type SceneFileType = "OBJ" | "FBX" | "GLB";

const PREVIEW_SIZE = 512;

export class ImportPreviewService {
  constructor(
    private encoder: SceneEncoder,
    private renderer: Renderer,
    private persistence: ScenePersistenceService
  ) {}

  async prepareFromDevice(
    type: SceneFileType,
    input: ArrayBuffer,
    resources: SceneImportResources | undefined,
    fileName: string
  ): Promise<{ preview: ImportPreviewData; prepared: PreparedDeviceImport }> {
    const scene = await this.encoder.import(type, input, resources);
    this.validateScene(scene);

    const previewUrl = await this.renderPreviewUrl(scene);
    const sceneMeta = await this.extractSceneMeta(scene, input.byteLength);

    return {
      preview: {
        previewUrl,
        sourceLabel: fileName,
        sceneMeta,
        textures: this.extractTextures(scene),
      },
      prepared: {
        kind: "device",
        type,
        fileName,
        fileSizeBytes: input.byteLength,
        scene,
      },
    };
  }

  async prepareFromFigma(
    frame: LinkedSelectionSummary
  ): Promise<{ preview: ImportPreviewData; prepared: PreparedFigmaImport }> {
    const restored = await this.persistence.restoreLinkedSceneData(
      frame.frameId
    );
    const glbBuffer = base64ToUint8Array(restored.glbBase64).buffer;
    const scene = await this.encoder.import("GLB", glbBuffer);
    this.validateScene(scene);

    const previewUrl = await this.renderPreviewUrl(scene);
    const frameMeta: ImportFrameMeta = {
      frameId: frame.frameId,
      frameName: frame.frameName,
      projectName: frame.projectName,
      sceneId: frame.sceneId,
    };

    return {
      preview: {
        previewUrl,
        sourceLabel: frame.frameName,
        frameMeta,
        sceneMeta: await this.extractSceneMeta(scene, glbBuffer.byteLength),
        textures: this.extractTextures(scene),
      },
      prepared: {
        kind: "figma",
        frame,
        restored,
        scene,
      },
    };
  }

  private validateScene(scene: Scene): void {
    if (!scene.meshes.length) {
      throw new Error("Сцена не содержит мешей");
    }
  }

  private async renderPreviewUrl(scene: Scene): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;

    const { png } = await this.renderer.renderScene(canvas, scene, {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      transparentBackground: true,
    });

    return URL.createObjectURL(png);
  }

  private async extractSceneMeta(
    scene: Scene,
    fileSizeBytes?: number
  ): Promise<ImportSceneMeta> {
    const textureCount = countSceneTextures(scene);

    const warnings: string[] = [];
    if (textureCount === 0) {
      warnings.push("текстуры не найдены");
    }

    const statusMessage =
      warnings.length > 0
        ? `Готово к импорту (${warnings.join(", ")})`
        : "Готово к импорту";

    return {
      polygonCount: await countScenePolygons(scene),
      meshCount: scene.meshes.length,
      textureCount,
      dimensions: formatSceneDimensions(scene),
      fileSizeBytes,
      statusMessage,
    };
  }

  private extractTextures(scene: Scene): ImportTexturePreview[] {
    const seen = new Map<string, ImportTexturePreview>();

    for (const material of Object.values(scene.materials)) {
      for (const slot of Object.values(TextureSlot)) {
        const tex = material.textures[slot];
        if (!tex?.url || seen.has(tex.url)) continue;

        seen.set(tex.url, {
          id: tex.url,
          name: material.name ? `${material.name} · ${slot}` : slot,
          url: tex.url,
        });
      }
    }

    return Array.from(seen.values());
  }
}
