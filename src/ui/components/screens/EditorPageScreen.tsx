import { NavLink } from "react-router";
import { SceneCanvas } from "../viewport/SceneViewport";
import { PanelObject, PanelScene } from "../organisms/Panels";
import { useActiveObject } from "@/app/ApplicationKernelContext";

export default function EditorPage() {
  const activeObj = useActiveObject();
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ position: "absolute" }}>
        <NavLink to="/">Main</NavLink>
      </div>
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
        <PanelObject />
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <SceneCanvas />
      </div>
    </div>
  );
}
