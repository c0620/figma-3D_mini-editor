import { SceneStorage } from '../store/sceneStorage';
import { NotificationService } from '../store/notificationService';
import { SceneAnalyzer } from '../render/sceneAnalyzer';
import { SceneEncoder } from './sceneEncoder';

type SceneFileType = 'OBJ' | 'FBX' | 'GLB';

export class SceneImportExportService {
  encoder: SceneEncoder;
  scene: SceneStorage;
  analyzer: SceneAnalyzer;
  notifications: NotificationService;

  constructor(
    encoder: SceneEncoder,
    scene: SceneStorage,
    analyzer: SceneAnalyzer,
    notifications: NotificationService,
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

  importFromDevice(type: SceneFileType, input: string): void {
    const scene = this.encoder.import(type, input);
    this.scene.load(scene);
  }
}
