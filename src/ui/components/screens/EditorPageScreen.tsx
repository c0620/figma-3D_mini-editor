import { NavLink } from "react-router";
import { SceneRenderer } from "../viewport/SceneViewport";
import { useActiveObject, useRender } from "@/app/ApplicationKernelContext";
import { PanelScene } from "../templates/panels/PanelScene";
import { PanelParams } from "../templates/panels/PanelParams";
import { TopTools } from "../templates/tools/TopTools";
import { BottomTools } from "../templates/tools/BottomTools";
import { useEffect } from "react";
import styles from "./EditorPageScreen.module.scss";

export default function EditorPage() {
  const activeObj = useActiveObject();
  const renderService = useRender();
  useEffect(
    () => () => renderService.disposeMaterialPreview(),
    [renderService]
  );
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div className={styles.pannels}>
        <PanelScene activeObj={activeObj} />
        {activeObj && <PanelParams activeObj={activeObj} />}
      </div>
      <div className={styles.tools}>
        <TopTools />
        <BottomTools activeObj={activeObj} />
      </div>
      <div className={styles.renderer}>
        <SceneRenderer />
      </div>
    </div>
  );
}
