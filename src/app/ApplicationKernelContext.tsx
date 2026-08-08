import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

import type { ActiveEntity, ObjectID, SceneObject } from "../types/scene";
import type { AppHandlers, AppKernel } from "./compositionRoot";
import { buildSceneEntityList } from "../store/sceneEntityList";
import { findSceneObject } from "../store/sceneStorage";
import { useSceneStore } from "../store/sceneStore";
import { useSessionStore } from "../store/sessionStore";

export type { SceneEntitySummary } from "../store/sceneEntityList";

const AppKernelContext = createContext<AppKernel | null>(null);

export function AppKernelProvider({
  kernel,
  children,
}: {
  kernel: AppKernel;
  children: ReactNode;
}) {
  return (
    <AppKernelContext.Provider value={kernel}>
      {children}
    </AppKernelContext.Provider>
  );
}

function useKernel(): AppKernel {
  const kernel = useContext(AppKernelContext);
  if (!kernel)
    throw new Error("useKernel must be used inside AppKernelProvider");
  return kernel;
}

export function useHandlers(): AppHandlers {
  return useKernel().handlers;
}

export function useHistory() {
  const { undo, redo } = useKernel();
  return { undo, redo };
}

export function useTransfer() {
  return useKernel().transfer;
}

export function useI18n() {
  return useKernel().i18n;
}

export function useTooltips() {
  return useKernel().tooltips;
}

export function useHelp() {
  return useKernel().help;
}

export function useNotifications() {
  return useKernel().notifications;
}

export function useRender() {
  return useKernel().renderService;
}

/**
 * Реактивный список объектов сцены для дерева и выбора.
 * Нельзя возвращать новый массив напрямую из селектора Zustand — при каждом рендере
 * это другая ссылка, React считает снимок стора изменённым → Maximum update depth exceeded.
 */
export function useSceneEntities() {
  const scene = useSceneStore((s) => s.scene);
  return useMemo(() => buildSceneEntityList(scene), [scene]);
}

export function useSceneObject(id: ObjectID | null): SceneObject | null {
  return useSceneStore((s) =>
    id && s.scene ? findSceneObject(s.scene, id) : null
  );
}

export function useActiveObject(): ActiveEntity | null {
  const activeObjectRef = useSessionStore((s) => s.activeObjectRef);
  return useSceneObject(activeObjectRef?.id ?? null) as ActiveEntity | null;
}

export function useActiveObjectRef() {
  return useSessionStore((s) => s.activeObjectRef);
}
