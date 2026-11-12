export enum FigmaAPITypes {
  findPluginFrames = "findPluginFrames",
  createFrame = "createFrame",
  setPluginData = "setPluginData",
  getPluginData = "getPluginData",
  insertImage = "insertImage",
  closePlugin = "closePlugin",
  placeRender = "placeRender",
}

export enum PluginDataKeys {
  sceneID = "sceneID",
  camera = "camera",
  scene = "scene",
  textureSectionID = "textureSectionID",
}

export type PluginNodeData = { [K in PluginDataKeys]: string };

export type UIParams = {
  [FigmaAPITypes.placeRender]: {
    frameID?: FrameNode["id"];
    nodeData: { [K in PluginDataKeys]: string };
    size: { width: number; height: number };
    imageBytes: Uint8Array;
    name: string;
  };
  [FigmaAPITypes.findPluginFrames]: {
    sceneID: string;
    options?:
      | { linkedOnly: boolean; plainOnly?: never }
      | { plainOnly: boolean; linkedOnly?: never };
  };
  [FigmaAPITypes.createFrame]: {
    name: string;
    width: number;
    height: number;
  };
  [FigmaAPITypes.setPluginData]: {
    nodeID: SceneNode["id"];
    key: PluginDataKeys;
    value: string;
  };
  [FigmaAPITypes.getPluginData]: {
    nodeID: SceneNode["id"];
    keys: string[];
  };

  [FigmaAPITypes.insertImage]: {
    frame: FrameNode;
    bytes: Uint8Array;
  };
  [FigmaAPITypes.closePlugin]: void;
};

export type FigmaAPIParams = {
  [FigmaAPITypes.placeRender]: {
    frameID: FrameNode["id"];
  };
  [FigmaAPITypes.findPluginFrames]: {
    nodes: ({
      nodeID: SceneNode["id"];
    } & PluginNodeData)[];
  };
  [FigmaAPITypes.createFrame]: {
    frameID: FrameNode["id"];
  };
  [FigmaAPITypes.setPluginData]: {
    nodeID: SceneNode["id"];
  };
  [FigmaAPITypes.getPluginData]: {
    nodeID: SceneNode["id"];
    data: object; //toDo:narrow type
  };
  [FigmaAPITypes.insertImage]: {};
  [FigmaAPITypes.closePlugin]: {};
};

export type UIRequests = {
  [K in FigmaAPITypes]: { type: K; id: string } & UIParams[K];
};

export type FigmaAPIAnswers = {
  [K in FigmaAPITypes]: { type: K; id: string } & FigmaAPIParams[K];
};
