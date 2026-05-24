import type { CameraState, Light, Material, SceneMesh } from "@/types/scene";
import { ScrollPanel } from "../atoms/Output";
import {
  useActiveMeshMaterials,
  useHandlers,
  usePreview,
} from "@/app/ApplicationKernelContext";
import { materialPreviewCacheKey } from "@/services/previewService";
import { useEffect, useMemo, useState } from "react";
import { MaterialPreviewThumb } from "../molecules/ScenePreviews";
import { ObjectNumberInput } from "../molecules/EditorInput";
import type { PanelMode } from "./PanelScene";
import { roughness } from "three/tsl";

export function PanelMesh({ mesh }: { mesh: SceneMesh }) {
  void mesh;
  const materials = useActiveMeshMaterials();
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [mode, setMode] = useState<PanelMode>("open");
  const { materialEditing } = useHandlers();

  const activeMaterial = materials ? materials[activeMaterialIndex] : null;

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
            {materials?.map((m, id) => (
              <MaterialPreviewThumb
                key={m.id}
                material={m}
                isActive={id === activeMaterialIndex}
                onClick={() => setActiveMaterialIndex(id)}
              />
            ))}
          </div>
        </ScrollPanel>
        {activeMaterial && (
          <>
            <p>Параметры {activeMaterial.name}</p>
            <ObjectNumberInput
              mode={mode}
              fields={[
                {
                  onChange: (field) =>
                    materialEditing.execute({
                      id: activeMaterial.id,
                      changes: { roughness: field },
                    }),
                  isActive: false,
                  value: activeMaterial.roughness,
                },
              ]}
              label="Шероховатость"
              sliderType="default"
            />
            <ObjectNumberInput
              mode={mode}
              fields={[
                {
                  onChange: (field) =>
                    materialEditing.execute({
                      id: activeMaterial.id,
                      changes: { metalness: field },
                    }),
                  isActive: false,
                  value: activeMaterial.metalness,
                },
              ]}
              label="Блеск"
              sliderType="default"
            />
            <ObjectNumberInput
              mode={mode}
              fields={[
                {
                  onChange: (field) =>
                    materialEditing.execute({
                      id: activeMaterial.id,
                      changes: { emissiveIntensity: field },
                    }),
                  isActive: false,
                  value: +activeMaterial.emissiveIntensity,
                },
              ]}
              label="Сила свечения"
              sliderType="default"
            />
          </>
        )}
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
