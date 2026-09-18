export enum WarningCode {
  PluginLights = "plugin-lights",
  PluginCamera = "plugin-camera",
  UnknownNode = "unknown-node",
  UnknownWarning = "unknown-warning",
}

export interface BaseWarning {
  descriptionTemp: string; //toDo: replace with code-descr mapping in UI
  code: WarningCode;
}

export class Warning implements BaseWarning {
  descriptionTemp = "Unknown Warning";
  code = WarningCode.UnknownWarning;
  source: string;
  nodeType?: string;

  constructor(source: string, nodeType?: string) {
    this.source = source;
    this.nodeType = nodeType;
  }
}

export class UnknownNodeWarning extends Warning {
  descriptionTemp = "UnknownNode";
  code = WarningCode.UnknownNode;

  constructor(source: string, nodeType: string) {
    super(source, nodeType);
  }
}

export class AddLightsWarning extends Warning {
  descriptionTemp = "PluginLights";
  code = WarningCode.PluginLights;

  constructor(source: string) {
    super(source);
  }
}

export class AddCameraWarning extends Warning {
  descriptionTemp = "PluginCamera";
  code = WarningCode.PluginCamera;

  constructor(source: string) {
    super(source);
  }
}
