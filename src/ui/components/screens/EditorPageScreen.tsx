import { NavLink } from "react-router";
import { SceneCanvas } from "../viewport/SceneViewport";
import { PanelScene } from "../organisms/PanelScene";
import { PanelMesh, PanelLight, PanelCamera } from "../organisms/PanelParams";
import { useActiveObject } from "@/app/ApplicationKernelContext";
import { PanelBottom, PanelTop } from "../organisms/EditorTools";
import { ExportModal } from "./ExportModal";
import { useState } from "react";

export default function EditorPage() {
  const activeObj = useActiveObject();
  const [isExportOpen, setIsExportOpen] = useState(false);

  let panelParams;
  switch (activeObj?.kind) {
    case "camera":
      panelParams = <PanelCamera camera={activeObj.data} />;
      break;
    case "light":
      panelParams = <PanelLight light={activeObj.data} />;
      break;
    case "mesh":
      panelParams = <PanelMesh mesh={activeObj.data} />;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {isExportOpen && (
        <ExportModal onClose={() => setIsExportOpen(false)} />
      )}
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: "10%",
          display: "flex",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <PanelScene activeObj={activeObj} />
        {panelParams}
      </div>
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <PanelTop openModal={(val: boolean) => setIsExportOpen(val)} />
        <PanelBottom activeObj={activeObj} />
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <SceneCanvas />
      </div>
    </div>
  );
}
