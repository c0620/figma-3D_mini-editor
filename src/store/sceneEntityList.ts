import type { TranslationKey } from "../i18n/en";
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

export function isSceneEnvironmentEntityId(
  sceneId: string,
  entityId: string
): boolean {
  return entityId === `${sceneId}:environment`;
}

/**
 * Плоский список объектов для дерева сцены и выбора активного объекта.
 * Порядок: меши → источники света → камера.
 *
 * @param t — функция перевода; если не передана, ключ i18n используется как есть.
 */
export function buildSceneEntityList(
  scene: Scene | null,
  t?: (key: TranslationKey) => string
): SceneEntitySummary[] {
  if (!scene) return [];

  const tr = t ?? ((k: string) => k);

  const items: SceneEntitySummary[] = [];

  for (const o of scene.meshes) {
    if (o.pendingDelete) continue;
    items.push({
      id: o.id,
      kind: "mesh",
      label: o.name || tr("entity.mesh.default"),
      visible: o.visible,
      locked: o.locked,
    });
  }

  for (const light of scene.lights) {
    if (light.pendingDelete) continue;
    const kindLabel =
      light.type === "Directional"
        ? tr("entity.light.directional")
        : tr("entity.light.ambient");
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
        ? tr("entity.camera.perspective")
        : tr("entity.camera.orthographic"),
    visible: true,
    locked: false,
  });

  return items;
}
