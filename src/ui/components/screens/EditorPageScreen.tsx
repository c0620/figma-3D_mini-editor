import { NavLink } from "react-router";
import { SceneRenderer } from "../viewport/SceneViewport";
import { useActiveObject, useRender } from "@/app/ApplicationKernelContext";
import { PanelScene } from "../templates/panels/PanelScene";
import { PanelParams } from "../templates/panels/PanelParams";
import { TopTools } from "../templates/tools/TopTools";
import { BottomTools } from "../templates/tools/BottomTools";
import { useEffect } from "react";

export default function EditorPage() {
  const activeObj = useActiveObject();
  const renderService = useRender();
  useEffect(
    () => () => renderService.disposeMaterialPreview(),
    [renderService]
  );
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
        {activeObj && <PanelParams activeObj={activeObj} />}
      </div>
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: "5%",
          height: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <TopTools />
        <BottomTools activeObj={activeObj} />
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <SceneRenderer />
      </div>
    </div>
  );
}
