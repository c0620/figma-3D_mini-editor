import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";

import type { CameraState, Light, SceneMesh } from "../types/scene";
import type { AppHandlers, AppKernel } from "./compositionRoot";
import type { TranslationKey } from "../i18n/en";
import type { Locale } from "../services/localizationService";
import { buildSceneEntityList } from "../store/sceneEntityList";
import { isSceneCameraEntityId } from "../store/sceneEntityList";
import { useSceneStore } from "../store/sceneStore";
import { useSessionStore } from "../store/sessionStore";

export type {
  SceneEntityKind,
  SceneEntitySummary,
} from "../store/sceneEntityList";

export type ActiveEntity =
  | { kind: "mesh"; data: SceneMesh }
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
  return <AppKernelContext value={kernel}>{children}</AppKernelContext>;
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

/**
 * Реактивный i18n-хук. Подписывается на `SessionStore.locale` —
 * при смене языка все компоненты, использующие `t()`, перерисуются.
 *
 * Возвращает:
 * - `t(key)` — перевод строки по типизированному ключу.
 * - `locale` — текущая локаль.
 * - `setLocale(locale)` — переключатель языка.
 */
export function useI18n(): {
  t: (key: TranslationKey) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
} {
  const i18n = useKernel().i18n;
  const locale = useSessionStore((s) => s.locale);

  const t = useCallback((key: TranslationKey) => i18n.t(key), [i18n, locale]);

  return { t, locale, setLocale: (l) => i18n.setLocale(l) };
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
 * Пересчитывается при изменении `scene` или `locale` (метки переводятся).
 */
export function useSceneEntities() {
  const scene = useSceneStore((s) => s.scene);
  const { t } = useI18n();
  return useMemo(() => buildSceneEntityList(scene, t), [scene, t]);
}

/**
 * Текущий активный объект сцены — меш, источник света, камера или окружение.
 * Возвращает дискриминированный union `ActiveEntity` или `null`.
 * Пересчитывается только при изменении `activeObjectId` или `scene`.
 */
export function useActiveObject(): ActiveEntity | null {
  const activeObjectId = useSessionStore((s) => s.activeObjectId);
  const scene = useSceneStore((s) => s.scene);

  return useMemo(() => {
    if (!activeObjectId || !scene) return null;

    if (isSceneCameraEntityId(scene.id, activeObjectId)) {
      return { kind: "camera", data: scene.camera };
    }

    const light = scene.lights.find((l) => l.id === activeObjectId);
    if (light) return { kind: "light", data: light };

    const obj = scene.meshes.find((o) => o.id === activeObjectId);
    if (obj) return { kind: "mesh", data: obj };

    return null;
  }, [activeObjectId, scene]);
}

/**
 * id текущего выбранного объекта (любого — меш, свет, камера, окружение).
 * Легковесная подписка: не тянет данные сцены.
 */
export function useActiveObjectId() {
  return useSessionStore((s) => s.activeObjectId);
}
