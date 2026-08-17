import { SceneStorage } from "../store/sceneStorage";
import { NotificationService } from "../services/notificationService";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { SceneEncoder } from "./sceneEncoder";
import type { ObjectID } from "@/types/scene";

type SceneFileType = "OBJ" | "FBX" | "GLB";

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

  exportToDevice(type: SceneFileType): Blob {
    const raw = this.encoder.export(type, this.scene.getScene());
    return new Blob([raw]);
  }

  async importFromDevice(
    type: SceneFileType,
    input: ArrayBuffer | string
  ): Promise<ObjectID> {
    const scene = await this.encoder.import(type, input, "LoadScene");
    this.scene.load(scene);
    return scene.id;
  }

  async addFromDevice(
    type: SceneFileType,
    input: ArrayBuffer | string
  ): Promise<ObjectID> {
    const scene = await this.encoder.import(type, input, "AddScene");

    Object.values(scene.cameras).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(scene.groups).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(scene.lights).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(scene.meshes).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(scene.materials).forEach((material) =>
      this.scene.addMaterial(material)
    );

    return scene.id;
  }
}
