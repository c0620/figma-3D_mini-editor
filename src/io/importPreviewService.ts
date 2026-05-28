import { Mesh } from "three";

import { base64ToUint8Array } from "@/lib/base64";
import type { LinkedSelectionSummary } from "@/figma/figmaMessages";
import { buildThreeSceneFromDomain } from "@/render/domainSceneBuilder";
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
    const textureUrls = new Set<string>();
    for (const material of Object.values(scene.materials)) {
      for (const slot of Object.values(TextureSlot)) {
        const tex = material.textures[slot];
        if (tex?.url) textureUrls.add(tex.url);
      }
    }

    const warnings: string[] = [];
    if (textureUrls.size === 0) {
      warnings.push("текстуры не найдены");
    }

    const statusMessage =
      warnings.length > 0
        ? `Готово к импорту (${warnings.join(", ")})`
        : "Готово к импорту";

    return {
      polygonCount: await this.countPolygons(scene),
      meshCount: scene.meshes.length,
      textureCount: textureUrls.size,
      dimensions: this.formatDimensions(scene),
      fileSizeBytes,
      statusMessage,
    };
  }

  private async countPolygons(scene: Scene): Promise<number> {
    let count = 0;
    const built = await buildThreeSceneFromDomain(scene, {
      includeCamera: false,
    });
    try {
      built.root.traverse((obj) => {
        if (!(obj instanceof Mesh)) return;
        const geometry = obj.geometry;
        if (!geometry) return;
        if (geometry.index) {
          count += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          count += geometry.attributes.position.count / 3;
        }
      });
    } finally {
      built.dispose();
    }

    return Math.round(count) || scene.meshes.length;
  }

  private formatDimensions(scene: Scene): string {
    if (!scene.meshes.length) return "—";

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (const mesh of scene.meshes) {
      const [x, y, z] = mesh.transform.position;
      const [sx, sy, sz] = mesh.transform.scale;
      minX = Math.min(minX, x - sx / 2);
      minY = Math.min(minY, y - sy / 2);
      minZ = Math.min(minZ, z - sz / 2);
      maxX = Math.max(maxX, x + sx / 2);
      maxY = Math.max(maxY, y + sy / 2);
      maxZ = Math.max(maxZ, z + sz / 2);
    }

    const w = Math.max(1, Math.round(maxX - minX));
    const h = Math.max(1, Math.round(maxY - minY));
    const d = Math.max(1, Math.round(maxZ - minZ));
    return `${w}×${h}×${d}`;
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
