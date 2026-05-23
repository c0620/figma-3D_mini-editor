import type { SceneMesh } from "@/types/scene";

export function PanelMesh({ mesh }: { mesh: SceneMesh }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      Panel Mesh
    </div>
  );
}

export function PanelCamera() {
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

export function PanelLight() {
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
