import type { CameraState, Light, Material, SceneMesh } from "@/types/scene";
import { ScrollPanel } from "../atoms/Output";
import {
  useActiveMeshMaterials,
  usePreview,
} from "@/app/ApplicationKernelContext";
import { materialPreviewCacheKey } from "@/services/previewService";
import { useEffect, useMemo, useState } from "react";
import { MaterialPreviewThumb } from "../molecules/ScenePreviews";

export function PanelMesh({ mesh }: { mesh: SceneMesh }) {
  void mesh;
  const materials = useActiveMeshMaterials();

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div>
        <p>Материалы меша</p>
        <ScrollPanel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {materials?.map((m) => (
              <MaterialPreviewThumb key={m.id} material={m} />
            ))}
          </div>
        </ScrollPanel>
      </div>
    </div>
  );
}

export function PanelCamera({ camera }: { camera: CameraState }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      Panel Camera
    </div>
  );
}

export function PanelLight({ light }: { light: Light }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      Panel Light
    </div>
  );
}
