import { SceneStorage } from "../store/sceneStorage";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { SceneEncoder } from "./sceneEncoder";
import type { Scene } from "@/types/scene";
import { OperationContext } from "@/services/information/operationContext";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";
import type { DeviceExportFormat, DeviceImportFormat } from "@/types/io";
import { AppError, ErrorCode } from "@/services/information/errors";

export class DeviceImportExportService {
  encoder: SceneEncoder;
  scene: SceneStorage;
  analyzer: SceneAnalyzer;

  constructor(
    encoder: SceneEncoder,
    scene: SceneStorage,
    analyzer: SceneAnalyzer,
  ) {
    this.encoder = encoder;
    this.scene = scene;
    this.analyzer = analyzer;
  }

  async exportToDevice(type: Omit<DeviceExportFormat, "PNG">): Promise<Blob> {
    let raw;
    let result: string | ArrayBuffer | undefined = undefined;
    switch (type) {
      case "OBJ":
        result = this.encoder.exportOBJ();
        break;
      case "GLTF":
        raw = await this.encoder.exportGLTF();
        break;
      default:
        throw new AppError(
          ErrorCode.UnsupportedExportFormat,
          `Unsupported export format: ${type}`,
        );
    }
    if (typeof raw === "object" && !Array.isArray(raw) && raw !== null) {
      result = JSON.stringify(raw);
    }
    if (!result)
      throw new AppError(ErrorCode.UnknownError, "Failed to export scene");
    return new Blob([result], {
      type: type === "OBJ" ? "text/plain" : "application/octet-stream", // or application/json for GLTF?
    });
  }

  async importFromDevice(
    type: DeviceImportFormat,
    input: ArrayBuffer | string,
    context: OperationContext,
  ): Promise<Scene | undefined> {
    const result = await this.encoder.import(type, input, "LoadScene", context);
    if (context.isAborted()) {
      result.registry.clear();
      return undefined;
    }

    threeAssetRegistry.replace(
      result.registry.assets,
      result.registry.materials,
    );
    this.scene.load(result.scene);

    return result.scene;
  }

  async addFromDevice(
    type: DeviceImportFormat,
    input: ArrayBuffer | string,
    context: OperationContext,
  ): Promise<Scene | undefined> {
    const result = await this.encoder.import(type, input, "AddScene", context);
    if (context.isAborted()) {
      result.registry.clear();
      return undefined;
    }

    threeAssetRegistry.merge(result.registry.assets, result.registry.materials);

    Object.values(result.scene.cameras).forEach((object) =>
      this.scene.addObject(object),
    );

    Object.values(result.scene.groups).forEach((object) =>
      this.scene.addObject(object),
    );

    Object.values(result.scene.lights).forEach((object) =>
      this.scene.addObject(object),
    );

    Object.values(result.scene.meshes).forEach((object) =>
      this.scene.addObject(object),
    );

    Object.values(result.scene.materials).forEach((material) =>
      this.scene.addMaterial(material),
    );

    return result.scene;
  }
}
