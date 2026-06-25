export enum CommandType {
  DeleteObject = "DeleteObject",
  TransformObject = "TransformObject",
  EditMaterial = "EditMaterial",
  ToggleVisibility = "ToggleVisibility",
  ToggleLock = "ToggleLock",
  SelectObject = "SelectObject",
  AddLight = "AddLight",
  EditLight = "EditLight",
  EditCamera = "EditCamera",
  SetBackground = "SetBackground",
  ToggleShadows = "ToggleShadows",
  RenameScene = "RenameScene",
  ImportTexture = "ImportTexture",
  ExportTexture = "ExportTexture",
  ImportSceneFile = "ImportSceneFile",
  ExportSceneFile = "ExportSceneFile",
  ImportSceneFigma = "ImportSceneFigma",
  ExportSceneFigma = "ExportSceneFigma",
  ExportRender = "ExportRender",
  AddObject = "AddObject",
}

export interface HistoryEntry<T> {
  type: CommandType;
  snapshot: T;
}
