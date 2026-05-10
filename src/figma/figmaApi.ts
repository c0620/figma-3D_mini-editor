export class FigmaAPI {
  colors: object = {};

  postMessage(message: object): void {
    parent.postMessage({ pluginMessage: message }, '*');
  }
}
