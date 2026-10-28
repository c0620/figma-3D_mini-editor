export enum WarningCode {
  PluginLights = "plugin-lights",
  PluginCamera = "plugin-camera",
  UnknownNode = "unknown-node",
  UnknownWarning = "unknown-warning",
  SkeletonNotSupported = "skeleton-not-supported",
}

export interface BaseWarning {
  descriptionTemp: string; //toDo: replace with code-descr mapping in UI
  code: WarningCode;
  type: "warning";
}

export class Warning implements BaseWarning {
  descriptionTemp = "Unknown Warning";
  code = WarningCode.UnknownWarning;
  source: string;
  nodeType?: string;
  readonly type = "warning";

  constructor(source: string, nodeType?: string) {
    this.source = source;
    this.nodeType = nodeType;
  }
}

export class UnknownNodeWarning extends Warning {
  descriptionTemp = "UnknownNode";
  code = WarningCode.UnknownNode;
  message?: string;

  constructor(source: string, nodeType: string, message?: string) {
    super(source, nodeType);
    this.message = message;
  }
}

export class SkeletonNotSupportedWarning extends Warning {
  descriptionTemp = "Skeleton is not supported";
  code = WarningCode.SkeletonNotSupported;

  constructor(source: string, nodeType?: string) {
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
