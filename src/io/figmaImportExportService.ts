import type { SceneStorage } from "@/store/sceneStorage";
import type { SceneEncoder } from "./sceneEncoder";
import type { SceneAnalyzer } from "@/services/sceneAnalyzerService";

class FigmaImportExportService {
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
  importFromFigma(frameId: string): Promise<void> {
    void frameId;
    return Promise.resolve();
  }
  exportToFigma(frameId: string): Promise<void> {
    void frameId;
    return Promise.resolve();
  }
}
