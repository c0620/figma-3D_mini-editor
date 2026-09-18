import { SceneStorage } from "../store/sceneStorage";
import { SceneAnalyzer } from "../services/sceneAnalyzerService";
import { SceneEncoder } from "./sceneEncoder";
import type { Scene } from "@/types/scene";
import { OperationContext } from "@/services/information/operationContext";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";

type SceneFileType = "OBJ" | "FBX" | "GLB";

export class SceneImportExportService {
  encoder: SceneEncoder;
  scene: SceneStorage;
  analyzer: SceneAnalyzer;

  constructor(
    encoder: SceneEncoder,
    scene: SceneStorage,
    analyzer: SceneAnalyzer
  ) {
    this.encoder = encoder;
    this.scene = scene;
    this.analyzer = analyzer;
  }

  exportToDevice(type: SceneFileType): Blob {
    const raw = this.encoder.export(type, this.scene.getScene());
    return new Blob([raw]);
  }

  async importFromDevice(
    type: SceneFileType,
    input: ArrayBuffer | string,
    context: OperationContext
  ): Promise<Scene | undefined> {
    const result = await this.encoder.import(type, input, "LoadScene", context);
    if (context.isAborted()) {
      result.registry.clear();
      return undefined;
    }

    threeAssetRegistry.replace(
      result.registry.assets,
      result.registry.materials
    );
    this.scene.load(result.scene);

    return result.scene;
  }

  async addFromDevice(
    type: SceneFileType,
    input: ArrayBuffer | string,
    context: OperationContext
  ): Promise<Scene | undefined> {
    const result = await this.encoder.import(type, input, "AddScene", context);
    if (context.isAborted()) {
      result.registry.clear();
      return undefined;
    }

    threeAssetRegistry.merge(result.registry.assets, result.registry.materials);

    Object.values(result.scene.cameras).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(result.scene.groups).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(result.scene.lights).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(result.scene.meshes).forEach((object) =>
      this.scene.addObject(object)
    );

    Object.values(result.scene.materials).forEach((material) =>
      this.scene.addMaterial(material)
    );

    return result.scene;
  }
}
