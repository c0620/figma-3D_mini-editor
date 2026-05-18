import type { Scene } from "../types/scene";

export type SceneEntityKind = "mesh" | "light" | "camera";

export interface SceneEntitySummary {
  id: string;
  kind: SceneEntityKind;
  label: string;
  visible: boolean;
  locked: boolean;
}

/** Стабильный id виртуальной камеры доменной сцены (в CameraState нет своего uuid). */
export function sceneCameraEntityId(sceneId: string): string {
  return `${sceneId}:camera`;
}

export function isSceneCameraEntityId(
  sceneId: string,
  entityId: string
): boolean {
  return entityId === sceneCameraEntityId(sceneId);
}

/**
 * Плоский список объектов для дерева сцены и выбора активного объекта.
 * Порядок: меши → источники света → камера → окружение.
 */
export function buildSceneEntityList(
  scene: Scene | null
): SceneEntitySummary[] {
  if (!scene) return [];

  const items: SceneEntitySummary[] = [];

  for (const o of scene.objects) {
    if (o.pendingDelete) continue;
    items.push({
      id: o.id,
      kind: "mesh",
      label: o.name || "Mesh",
      visible: o.visible,
      locked: o.locked,
    });
  }

  for (const light of scene.lights) {
    const kindLabel =
      light.type === "Directional" ? "Направленный свет" : "Окружающий свет";
    items.push({
      id: light.id,
      kind: "light",
      label: `${kindLabel} (${light.id.slice(0, 8)})`,
      visible: light.visible,
      locked: light.locked,
    });
  }

  items.push({
    id: sceneCameraEntityId(scene.id),
    kind: "camera",
    label:
      scene.camera.type === "Perspective"
        ? "Камера (перспектива)"
        : "Камера (ортография)",
    visible: true,
    locked: false,
  });

  return items;
}
