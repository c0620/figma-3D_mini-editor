import { useEffect } from "react";

import { useFigma, useHandlers } from "@/app/ApplicationKernelContext";
import { isFigmaPlugin } from "@/figma/figmaApi";
import { useSceneStore } from "@/store/sceneStore";

export function useFigmaColorVariableSync(): void {
  const figma = useFigma();
  const { materialEditing } = useHandlers();

  useEffect(() => {
    if (!isFigmaPlugin()) return;

    const syncBoundMaterials = async () => {
      const scene = useSceneStore.getState().scene;
      if (!scene) return;

      for (const material of Object.values(scene.materials)) {
        if (!material.baseColorVariableId) continue;
        try {
          const hex = await figma.resolveColorVariable(
            material.baseColorVariableId
          );
          if (hex !== material.baseColor) {
            materialEditing.execute({
              id: material.id,
              changes: { baseColor: hex },
            });
          }
        } catch {
          // Variable removed or unresolved — keep last color.
        }
      }
    };

    const unsubscribe = figma.subscribeVariableChanges(() => {
      void syncBoundMaterials();
    });

    return unsubscribe;
  }, [figma, materialEditing]);
}
