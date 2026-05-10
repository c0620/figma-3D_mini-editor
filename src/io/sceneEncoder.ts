import type { Scene } from '../types/scene';

type SceneFileType = 'OBJ' | 'FBX' | 'GLB';
type ImportFileType = SceneFileType | 'Figma';

export class SceneEncoder {
  export(type: SceneFileType, scene: Scene): string {
    void type;
    void scene;
    return '';
  }

  import(type: ImportFileType, raw: string): Scene {
    void type;
    void raw;
    return {} as Scene;
  }
}
