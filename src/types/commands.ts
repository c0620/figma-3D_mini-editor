export enum CommandType {
  DeleteModel = 'DeleteModel',
  TransformObject = 'TransformObject',
  EditMaterial = 'EditMaterial',
  ToggleVisibility = 'ToggleVisibility',
  ToggleLock = 'ToggleLock',
  SelectObject = 'SelectObject',
  AddLight = 'AddLight',
  EditLight = 'EditLight',
  EditCamera = 'EditCamera',
  SetBackground = 'SetBackground',
  ToggleShadows = 'ToggleShadows',
  RenameScene = 'RenameScene',
  ImportTexture = 'ImportTexture',
  ExportTexture = 'ExportTexture',
  ImportSceneFile = 'ImportSceneFile',
  ExportSceneFile = 'ExportSceneFile',
  ImportSceneFigma = 'ImportSceneFigma',
  ExportSceneFigma = 'ExportSceneFigma',
  ExportRender = 'ExportRender',
}

export interface HistoryEntry {
  type: CommandType;
  payload: object;
  timestamp: number;
}
