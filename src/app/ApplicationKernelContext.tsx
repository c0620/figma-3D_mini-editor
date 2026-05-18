import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

import type {
  CameraState,
  EnvironmentState,
  Light,
  SceneObject,
} from "../types/scene";
import type { AppHandlers, AppKernel } from "./compositionRoot";
import { buildSceneEntityList } from "../store/sceneEntityList";
import { isSceneCameraEntityId } from "../store/sceneEntityList";
import { useSceneStore } from "../store/sceneStore";
import { useUiStore } from "../store/uiStore";

export type {
  SceneEntityKind,
  SceneEntitySummary,
} from "../store/sceneEntityList";

export type ActiveEntity =
  | { kind: "mesh"; data: SceneObject }
  | { kind: "light"; data: Light }
  | { kind: "camera"; data: CameraState };

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

/**
 * Реактивный список объектов сцены для дерева и выбора.
 * Нельзя возвращать новый массив напрямую из селектора Zustand — при каждом рендере
 * это другая ссылка, React считает снимок стора изменённым → Maximum update depth exceeded.
 */
export function useSceneEntities() {
  const scene = useSceneStore((s) => s.scene);
  return useMemo(() => buildSceneEntityList(scene), [scene]);
}

/**
 * Текущий активный объект сцены — меш, источник света, камера или окружение.
 * Возвращает дискриминированный union `ActiveEntity` или `null`.
 * Пересчитывается только при изменении `activeObjectId` или `scene`.
 */
export function useActiveObject(): ActiveEntity | null {
  const activeObjectId = useUiStore((s) => s.activeObjectId);
  const scene = useSceneStore((s) => s.scene);

  return useMemo(() => {
    if (!activeObjectId || !scene) return null;

    if (isSceneCameraEntityId(scene.id, activeObjectId)) {
      return { kind: "camera", data: scene.camera };
    }

    const light = scene.lights.find((l) => l.id === activeObjectId);
    if (light) return { kind: "light", data: light };

    const obj = scene.objects.find((o) => o.id === activeObjectId);
    if (obj) return { kind: "mesh", data: obj };

    return null;
  }, [activeObjectId, scene]);
}

/**
 * id текущего выбранного объекта (любого — меш, свет, камера, окружение).
 * Легковесная подписка: не тянет данные сцены.
 */
export function useActiveObjectId() {
  return useUiStore((s) => s.activeObjectId);
}
