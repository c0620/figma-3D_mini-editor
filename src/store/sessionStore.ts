import { create } from "zustand";

import type { Notification } from "../types/ui";
import type { ObjectRef, ObjectID } from "@/types/scene";
import { IDs } from "@/io/sceneEncoder";

type colorTheme = "Light" | "Dark";
type windowSize = "Small" | "Large";
export type ObjectToolMode = "translate" | "rotate" | "scale";

export interface UiState {
  colorTheme: colorTheme;
  windowSize: windowSize;
  activeObjectRef: ObjectRef | null;
  activeCameraID: ObjectID;
  projectName: string;
  notifications: Notification[];
  canUndo: boolean;
  canRedo: boolean;
  activeObjectTool: ObjectToolMode | null;
  isCameraPreview: boolean;
  cameraCustomAngle: { azimuth: number; polar: number } | null;
}

interface UiActions {
  setColorTheme(theme: colorTheme): void;
  setWindowSize(size: windowSize): void;
  setActiveObjectRef(ref: ObjectRef | null): void;
  setActiveCameraID(id: ObjectID): void;
  setProjectName(name: string): void;
  pushNotification(notification: Notification): void;
  removeNotification(id: string): void;
  setHistoryFlags(canUndo: boolean, canRedo: boolean): void;
  setActiveObjectTool(tool: ObjectToolMode | null): void;
  toggleCameraPreview(): void;
  setCameraCustomAngle(azimuth: number, polar: number): void;
}

export const useSessionStore = create<UiState & UiActions>((set) => ({
  colorTheme: "Dark",
  windowSize: "Large",
  activeObjectRef: null,
  activeCameraID: IDs.PluginCamera,
  projectName: "",
  notifications: [],
  canUndo: false,
  canRedo: false,
  activeObjectTool: null,
  isCameraPreview: false,
  cameraCustomAngle: null,

  setColorTheme: (theme) => set({ colorTheme: theme }),
  setWindowSize: (size) => set({ windowSize: size }),
  setActiveObjectRef: (ref) => set({ activeObjectRef: ref }),
  setActiveCameraID: (id) => set({ activeCameraID: id }),
  setProjectName: (name) => set({ projectName: name }),
  pushNotification: (notification) =>
    set((s) => ({ notifications: [...s.notifications, notification] })),
  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),
  setActiveObjectTool: (tool) => set({ activeObjectTool: tool }),
  toggleCameraPreview: () =>
    set((state) => ({
      isCameraPreview: !state.isCameraPreview,
    })),
  setCameraCustomAngle: (azimuth, polar) =>
    set({ cameraCustomAngle: { azimuth, polar } }),
}));
