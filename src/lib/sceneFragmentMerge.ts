import { randomUUID } from "./randomId";
import { threeAssetRegistry } from "../store/threeAssetRegistry";
import type { Scene } from "../types/scene";

/** Уникальные id mesh/material перед merge фрагмента в существующую сцену. */
export function remapSceneFragmentIds(fragment: Scene): Scene {
  const materialIdMap = new Map<string, string>();
  const materials: Scene["materials"] = {};

  for (const [oldId, material] of Object.entries(fragment.materials)) {
    const newId = randomUUID();
    materialIdMap.set(oldId, newId);
    materials[newId] = { ...material, id: newId };
  }

  const meshes = fragment.meshes.map((mesh) => {
    const newMeshId = randomUUID();
    const asset = threeAssetRegistry.get(mesh.id);
    if (asset) {
      threeAssetRegistry.register(newMeshId, asset);
      threeAssetRegistry.delete(mesh.id);
    }

    return {
      ...mesh,
      id: newMeshId,
      materialIDs: mesh.materialIDs.map(
        (materialId) => materialIdMap.get(materialId) ?? materialId
      ),
    };
  });

  return {
    ...fragment,
    meshes,
    materials,
  };
}
