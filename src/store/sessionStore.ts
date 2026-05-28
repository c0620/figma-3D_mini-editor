import { create } from "zustand";

import type {
  ActiveTransformToolMode,
  ColorTheme,
  Notification,
  windowSize,
} from "../types/ui";
import type { Locale } from "../services/localizationService";
import { useSceneStore } from "./sceneStore";
import { isSceneCameraEntityId } from "./sceneEntityList";

export interface UiState {
  activeObjectId: string | null;
  transformToolMode: ActiveTransformToolMode;
  projectName: string;
  notifications: Notification[];
  canUndo: boolean;
  canRedo: boolean;
  locale: Locale;
  colorTheme: ColorTheme;
  windowSize: windowSize;
  helpModalOpen: boolean;
}

interface UiActions {
  setActiveObjectId(id: string | null): void;
  setTransformToolMode(mode: ActiveTransformToolMode): void;
  setProjectName(name: string): void;
  pushNotification(notification: Notification): void;
  removeNotification(id: string): void;
  setHistoryFlags(canUndo: boolean, canRedo: boolean): void;
  setLocale(locale: Locale): void;
  setColorTheme(theme: ColorTheme): void;
  toggleColorTheme(): void;
  toggleWindowSize(): void;
  setHelpModalOpen: (open: boolean) => void;
}

export const useSessionStore = create<UiState & UiActions>((set) => ({
  activeObjectId: null,
  transformToolMode: null,
  projectName: "",
  notifications: [],
  canUndo: false,
  canRedo: false,
  locale: "ru" as Locale,
  colorTheme: "Dark",
  windowSize: "Large",
  helpModalOpen: false,

  setActiveObjectId: (id) => set({ activeObjectId: id }),
  setTransformToolMode: (mode) => {
    if (mode === "scale") {
      const { activeObjectId } = useSessionStore.getState();
      const scene = useSceneStore.getState().scene;
      if (
        activeObjectId &&
        scene &&
        isSceneCameraEntityId(scene.id, activeObjectId)
      ) {
        set({ transformToolMode: null });
        return;
      }
    }
    set({ transformToolMode: mode });
  },
  setProjectName: (name) => set({ projectName: name }),
  pushNotification: (notification) =>
    set((s) => ({ notifications: [...s.notifications, notification] })),
  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),
  setLocale: (locale) => set({ locale }),
  setColorTheme: (theme) => set({ colorTheme: theme }),
  toggleColorTheme: () =>
    set((s) => ({
      colorTheme: s.colorTheme === "Dark" ? "Light" : "Dark",
    })),
  toggleWindowSize: () =>
    set((s) => ({ windowSize: s.windowSize === "Large" ? "Small" : "Large" })),
  setHelpModalOpen: (open) => set({ helpModalOpen: open }),
}));
