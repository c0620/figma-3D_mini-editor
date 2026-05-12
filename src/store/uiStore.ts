import { create } from 'zustand';

import type { Notification } from '../types/ui';

interface UiState {
  activeObjectId: string | null;
  projectName: string;
  notifications: Notification[];
  canUndo: boolean;
  canRedo: boolean;
}

interface UiActions {
  setActiveObjectId(id: string | null): void;
  setProjectName(name: string): void;
  pushNotification(notification: Notification): void;
  removeNotification(id: string): void;
  setHistoryFlags(canUndo: boolean, canRedo: boolean): void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  activeObjectId: null,
  projectName: '',
  notifications: [],
  canUndo: false,
  canRedo: false,

  setActiveObjectId: (id) => set({ activeObjectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  pushNotification: (notification) =>
    set((s) => ({ notifications: [...s.notifications, notification] })),
  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),
}));
