export class SceneNamingService {
  buildFrameName(sceneName: string, materialName: string): string {
    return `${sceneName}__texture__${materialName}`;
  }

  buildRenderName(sceneName: string): string {
    return `${sceneName}__render`;
  }
}
