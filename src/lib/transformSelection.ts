import type { ActiveEntity } from "@/app/ApplicationKernelContext";
import type { Scene } from "@/types/scene";

export function isTransformEditable(active: ActiveEntity | null): boolean {
  if (!active) return false;
  return (
    active.kind === "mesh" ||
    (active.kind === "light" && active.data.type === "Spot") ||
    active.kind === "camera"
  );
}

export function supportsTransformScale(active: ActiveEntity | null): boolean {
  if (!active) return true;
  return active.kind !== "camera";
}

export function isSelectionLocked(
  scene: Scene,
  active: ActiveEntity
): boolean {
  switch (active.kind) {
    case "mesh":
      return scene.meshes.find((o) => o.id === active.data.id)?.locked ?? false;
    case "light":
      return scene.lights.find((l) => l.id === active.data.id)?.locked ?? false;
    case "camera":
      return scene.camera.locked;
  }
}
