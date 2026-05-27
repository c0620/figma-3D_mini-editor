import { SceneStorage } from "../store/sceneStorage";
import { NotificationService } from "../store/notificationService";
import { SceneAnalyzer } from "../render/sceneAnalyzer";
import type { SceneExportOptions } from "../types/export";
import { SceneEncoder, type SceneImportResources } from "./sceneEncoder";

type SceneFileType = "OBJ" | "FBX" | "GLB";

export type { SceneImportResources };

export class SceneImportExportService {
  encoder: SceneEncoder;
  scene: SceneStorage;
  analyzer: SceneAnalyzer;
  notifications: NotificationService;

  constructor(
    encoder: SceneEncoder,
    scene: SceneStorage,
    analyzer: SceneAnalyzer,
    notifications: NotificationService
  ) {
    this.encoder = encoder;
    this.scene = scene;
    this.analyzer = analyzer;
    this.notifications = notifications;
  }

  async exportToDevice(type: SceneFileType, options?: SceneExportOptions): Promise<Blob> {
    const scene = this.scene.getScene();
    if (!scene) return new Blob();
    const raw = await this.encoder.export(type, scene, options);
    return new Blob([raw]);
  }

  async importFromDevice(
    type: SceneFileType,
    input: ArrayBuffer | string,
    resources?: SceneImportResources
  ): Promise<void> {
    const scene = await this.encoder.import(type, input, resources);
    this.scene.load(scene);
  }
}
