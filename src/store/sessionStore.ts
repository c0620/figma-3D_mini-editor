import { create } from "zustand";

import type { Notification } from "../types/ui";

type colorTheme = "Light" | "Dark";
type windowSize = "Small" | "Large";
export type ObjectToolMode = "translate" | "rotate" | "scale";

export interface UiState {
  colorTheme: colorTheme;
  windowSize: windowSize;
  activeObjectId: string | null;
  projectName: string;
  notifications: Notification[];
  canUndo: boolean;
  canRedo: boolean;
  activeObjectTool: ObjectToolMode | null;
}

interface UiActions {
  setColorTheme(theme: colorTheme): void;
  setWindowSize(size: windowSize): void;
  setActiveObjectId(id: string | null): void;
  setProjectName(name: string): void;
  pushNotification(notification: Notification): void;
  removeNotification(id: string): void;
  setHistoryFlags(canUndo: boolean, canRedo: boolean): void;
  setActiveObjectTool(tool: ObjectToolMode | null): void;
}

export const useSessionStore = create<UiState & UiActions>((set) => ({
  colorTheme: "Dark",
  windowSize: "Large",
  activeObjectId: null,
  projectName: "",
  notifications: [],
  canUndo: false,
  canRedo: false,
  activeObjectTool: null,

  setColorTheme: (theme) => set({ colorTheme: theme }),
  setWindowSize: (size) => set({ windowSize: size }),
  setActiveObjectId: (id) => set({ activeObjectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  pushNotification: (notification) =>
    set((s) => ({ notifications: [...s.notifications, notification] })),
  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),
  setActiveObjectTool: (tool) => set({ activeObjectTool: tool }),
}));
