import { NavLink } from "react-router";
import { SceneRenderer } from "../viewport/SceneViewport";
import { useActiveObject, useRender } from "@/app/ApplicationKernelContext";
import { PanelScene } from "../templates/panels/PanelScene";
import { PanelParams } from "../templates/panels/PanelParams";
import { TopTools } from "../templates/tools/TopTools";
import { BottomTools } from "../templates/tools/BottomTools";
import { useEffect } from "react";
import styles from "./EditorPageScreen.module.scss";
import { BaseModal } from "../templates/modal/BaseModal";
import { useSessionStore, type ModalType } from "@/store/sessionStore";
import { AddObjectModalContent } from "../templates/modal/import/AddObjectModalContent";
import { ExportModal } from "../templates/modal/export/ExportModal";

export default function EditorPage() {
  const activeObj = useActiveObject();
  const renderService = useRender();
  useEffect(
    () => () => renderService.disposeMaterialPreview(),
    [renderService]
  );

  const modalType = useSessionStore((s) => s.modalType);

  const modals: Record<NonNullable<ModalType>, React.ReactNode> = {
    addObject: <AddObjectModalContent />,
    export: <ExportModal />,
    help: undefined,
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div className={styles.pannels}>
        <PanelScene activeObj={activeObj} />
        {activeObj && <PanelParams activeObj={activeObj} />}
      </div>
      <div className={styles.tools}>
        <TopTools type="project" />
        <BottomTools activeObj={activeObj} />
      </div>
      <div className={styles.renderer}>
        <SceneRenderer />
      </div>
      {modalType && modals[modalType]}
    </div>
  );
}
