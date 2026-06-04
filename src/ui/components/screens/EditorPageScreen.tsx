import { NavLink } from "react-router";
import { SceneRenderer } from "../viewport/SceneViewport";
import { useActiveObject } from "@/app/ApplicationKernelContext";
import { PanelScene } from "../organisms/panels/PanelScene";
import { PanelParams } from "../organisms/panels/PanelParams";

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
          top: "5%",
          display: "flex",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <PanelScene activeObj={activeObj} />
        <PanelParams />
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <SceneRenderer />
      </div>
    </div>
  );
}
