import { SceneCanvas } from "../viewport/SceneViewport";
import { PanelScene } from "../organisms/PanelScene";
import { PanelMesh, PanelLight, PanelCamera } from "../organisms/PanelParams";
import { useActiveObject } from "@/app/ApplicationKernelContext";
import { PanelBottom, PanelTop } from "../organisms/EditorTools";
import { AssetLibraryModal } from "./AssetLibraryModal";
import { ExportModal } from "./ExportModal";
import { ExportSuccessModal } from "./ExportSuccessModal";
import { useCallback, useState } from "react";
export default function EditorPage() {
  const activeObj = useActiveObject();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportSuccessOpen, setIsExportSuccessOpen] = useState(false);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);

  const handleExportDismiss = useCallback(() => {
    setIsExportOpen(false);
  }, []);

  const handleExportComplete = useCallback((ok: boolean) => {
    if (ok) setIsExportSuccessOpen(true);
  }, []);

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
    <div className="page page--editor">
      {isExportOpen && (
        <ExportModal
          onClose={() => setIsExportOpen(false)}
          onExportDismiss={handleExportDismiss}
          onExportComplete={handleExportComplete}
        />
      )}
      {isExportSuccessOpen && (
        <ExportSuccessModal onClose={() => setIsExportSuccessOpen(false)} />
      )}
      {isAssetLibraryOpen && (
        <AssetLibraryModal onClose={() => setIsAssetLibraryOpen(false)} />
      )}
      <div className="editor-overlay editor-side-panels">
        <PanelScene
          activeObj={activeObj}
          onOpenAssetLibrary={() => setIsAssetLibraryOpen(true)}
        />
        {panelParams}
      </div>
      <div className="editor-overlay editor-toolbar-layer">
        <div className="editor-toolbar-row editor-toolbar-row--top">
          <PanelTop openModal={(val: boolean) => setIsExportOpen(val)} />
        </div>
        <div className="editor-toolbar-row editor-toolbar-row--bottom">
          <PanelBottom activeObj={activeObj} />
        </div>
      </div>
      <div className="page_fill">
        <SceneCanvas />
      </div>
    </div>
  );
}
