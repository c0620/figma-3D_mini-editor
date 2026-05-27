export type TransformToolMode = "translate" | "rotate" | "scale";
export type ActiveTransformToolMode = TransformToolMode | null;

export interface TooltipData {
  toolId: string;
  name: string;
  description: string;
  shortcut: string;
}

export interface ShortcutItem {
  toolId: string;
  keys: string;
}

export interface Notification {
  id: string;
  type: "Success" | "Error";
  message: string;
  reason: string | null;
  createdAt: number;
}
