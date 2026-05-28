import { useEffect, useState } from "react";
import { EditorIconButton } from "../atoms/Button";
import { InputColor, InputProjectName } from "../atoms/Input";
import {
  useHandlers,
  useHistory,
  useI18n,
  type ActiveEntity,
} from "@/app/ApplicationKernelContext";
import { supportsTransformScale } from "@/lib/transformSelection";
import { useSceneStore } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";
import type { ActiveTransformToolMode, TransformToolMode } from "@/types/ui";

import settingsIcon from "@/assets/images/icons/descriptive/settings.svg";
import garbageIcon from "@/assets/images/icons/descriptive/garbage.svg";
import bgIcon from "@/assets/images/icons/state/bgOn.svg";
import lightingIcon from "@/assets/images/icons/descriptive/lighting.svg";
import infoIcon from "@/assets/images/icons/descriptive/info.svg";
import renderIcon from "@/assets/images/icons/descriptive/render.svg";
import reloadIcon from "@/assets/images/icons/descriptive/reload.svg";
import panIcon from "@/assets/images/icons/descriptive/pan.svg";
import rotateIcon from "@/assets/images/icons/descriptive/rotate.svg";
import scaleIcon from "@/assets/images/icons/descriptive/scale.svg";
import undoIcon from "@/assets/images/icons/descriptive/undo.svg";
import redoIcon from "@/assets/images/icons/descriptive/redo.svg";
import buttonStyles from "../atoms/Button.module.css";
import styles from "./EditorTools.module.css";

function isTextInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
}

function toggleTransformTool(
  current: ActiveTransformToolMode,
  next: TransformToolMode
): ActiveTransformToolMode {
  return current === next ? null : next;
}

export function PanelBottom({ activeObj }: { activeObj: ActiveEntity | null }) {
  const transformToolMode = useSessionStore((s) => s.transformToolMode);
  const setTransformToolMode = useSessionStore((s) => s.setTransformToolMode);
  const canUndo = useSessionStore((s) => s.canUndo);
  const canRedo = useSessionStore((s) => s.canRedo);
  const { undo, redo } = useHistory();
  const scaleEnabled = supportsTransformScale(activeObj);
  const hasSelection = activeObj != null;

  useEffect(() => {
    if (!scaleEnabled && transformToolMode === "scale") {
      setTransformToolMode(null);
    }
  }, [scaleEnabled, transformToolMode, setTransformToolMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTextInputFocused()) return;

      const mod = event.ctrlKey || event.metaKey;
      if (mod) {
        if (event.code === "KeyZ" && !event.shiftKey) {
          event.preventDefault();
          undo();
          return;
        }
        if (
          event.code === "KeyY" ||
          (event.code === "KeyZ" && event.shiftKey)
        ) {
          event.preventDefault();
          redo();
          return;
        }
      }

      const keyToMode: Record<string, TransformToolMode> = {
        g: "translate",
        r: "rotate",
        s: "scale",
      };
      const mode = keyToMode[event.key.toLowerCase()];
      if (!mode) return;
      if (mode === "scale" && !scaleEnabled) return;

      event.preventDefault();
      setTransformToolMode(mode);
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [scaleEnabled, setTransformToolMode, undo, redo]);

  return (
    <div className={styles.bottomBar}>
      {hasSelection ? (
        <div className="tools-container tools-container--compact">
          <div className="tools-group">
            <EditorIconButton
              src={panIcon}
              title="Move (G)"
              active={transformToolMode === "translate"}
              onClick={() =>
                setTransformToolMode(
                  toggleTransformTool(transformToolMode, "translate")
                )
              }
            />
            <EditorIconButton
              src={rotateIcon}
              title="Rotate (R)"
              active={transformToolMode === "rotate"}
              onClick={() =>
                setTransformToolMode(
                  toggleTransformTool(transformToolMode, "rotate")
                )
              }
            />
            <EditorIconButton
              src={scaleIcon}
              title="Scale (S)"
              active={transformToolMode === "scale"}
              disabled={!scaleEnabled}
              onClick={() =>
                setTransformToolMode(
                  toggleTransformTool(transformToolMode, "scale")
                )
              }
            />
          </div>
        </div>
      ) : null}
      <div className="tools-container tools-container--compact">
        <div className="tools-group">
          <EditorIconButton
            src={undoIcon}
            title="Undo"
            disabled={!canUndo}
            onClick={undo}
          />
          <EditorIconButton
            src={redoIcon}
            title="Redo"
            disabled={!canRedo}
            onClick={redo}
          />
        </div>
      </div>
    </div>
  );
}

export function PanelTop({ openModal }: { openModal: (val: boolean) => void }) {
  const scene = useSceneStore((s) => s.scene);
  const { deletion, background, shadows, selection } = useHandlers();
  const { t } = useI18n();
  const [bgOpen, setBgOpen] = useState(false);

  const backgroundColor = scene?.environment.backgroundColor ?? null;
  const shadowsEnabled = scene?.environment.shadowsEnabled ?? false;

  const hasDeletableEntities =
    (scene?.meshes.some((m) => !m.pendingDelete) ?? false) ||
    (scene?.lights.some((l) => !l.pendingDelete) ?? false);

  const handleDeleteAll = () => {
    if (!scene) return;
    for (const mesh of scene.meshes) {
      if (!mesh.pendingDelete) {
        deletion.execute({ modelId: mesh.id, type: "mesh" });
      }
    }
    for (const light of scene.lights) {
      if (!light.pendingDelete) {
        deletion.execute({ modelId: light.id, type: "light" });
      }
    }
    selection.execute({ id: null });
  };

  const handleToggleShadows = () => {
    shadows.execute({ shadowsEnabled: !shadowsEnabled });
  };

  return (
    <div className={styles.topBar}>
      <div className={`tools-container ${styles.topBarMain}`}>
        <div className="tools-group">
          <EditorIconButton
            src={settingsIcon}
            title={t("panel.scene.title")}
            onClick={() => console.log("settings")}
          />
          <EditorIconButton
            src={garbageIcon}
            title="Delete all"
            disabled={!hasDeletableEntities}
            onClick={handleDeleteAll}
          />
          <div className={styles.bgControl}>
            <EditorIconButton
              src={bgIcon}
              title="Background"
              active={backgroundColor != null || bgOpen}
              onClick={() => setBgOpen((v) => !v)}
            />
            {bgOpen ? (
              <div
                className={buttonStyles.bgPopover}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <InputColor
                  layout="compact"
                  color={backgroundColor ?? "#000000"}
                  onChange={(hex) =>
                    background.execute({ backgroundColor: hex })
                  }
                />
                <EditorIconButton
                  src={reloadIcon}
                  title="Reset background"
                  disabled={!backgroundColor}
                  onClick={() => {
                    background.execute({ backgroundColor: null });
                    setBgOpen(false);
                  }}
                />
              </div>
            ) : null}
          </div>
          <EditorIconButton
            src={lightingIcon}
            title="Shadows"
            active={shadowsEnabled}
            onClick={handleToggleShadows}
          />
        </div>
        <InputProjectName className={styles.topBarProjectName} toolbar />
      </div>

      <div className="tools-container tools-container--compact">
        <div className="tools-group">
          <EditorIconButton
            src={infoIcon}
            title="Help"
            onClick={() => useSessionStore.getState().setHelpModalOpen(true)}
          />
        </div>
      </div>

      <div className={styles.topBarExportShell}>
        <div className="tools-container tools-container--compact">
          <div className="tools-group">
            <EditorIconButton
              src={renderIcon}
              title="Export"
              onClick={() => openModal(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
