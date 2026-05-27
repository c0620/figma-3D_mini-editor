import { useEffect } from "react";
import { NavLink } from "react-router";
import { PanelButton } from "../atoms/Button";
import { InputColor, InputProjectName } from "../atoms/Input";
import {
  useHandlers,
  useHistory,
  type ActiveEntity,
} from "@/app/ApplicationKernelContext";
import { supportsTransformScale } from "@/lib/transformSelection";
import { useSceneStore } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";
import type { ActiveTransformToolMode, TransformToolMode } from "@/types/ui";

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
    <div style={{ userSelect: "none", zIndex: 10, display: "flex" }}>
      <div style={{ display: "flex" }}>
        <PanelButton
          url="P"
          active={transformToolMode === "translate"}
          onClick={() =>
            setTransformToolMode(
              toggleTransformTool(transformToolMode, "translate")
            )
          }
        />
        <PanelButton
          url="R"
          active={transformToolMode === "rotate"}
          onClick={() =>
            setTransformToolMode(
              toggleTransformTool(transformToolMode, "rotate")
            )
          }
        />
        <PanelButton
          url="S"
          active={transformToolMode === "scale"}
          disabled={!scaleEnabled}
          onClick={() =>
            setTransformToolMode(
              toggleTransformTool(transformToolMode, "scale")
            )
          }
        />
      </div>
      <div style={{ userSelect: "none", zIndex: 10, display: "flex" }}>
        <PanelButton url="<-" disabled={!canUndo} onClick={undo} />
        <PanelButton url="->" disabled={!canRedo} onClick={redo} />
      </div>
    </div>
  );
}

export function PanelTop() {
  const scene = useSceneStore((s) => s.scene);
  const { deletion, background, shadows, selection } = useHandlers();

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
    <div style={{ userSelect: "none", zIndex: 10, display: "flex" }}>
      <div style={{ display: "flex" }}>
        <NavLink to="/">Main</NavLink>
        <PanelButton
          url="del"
          disabled={!hasDeletableEntities}
          onClick={handleDeleteAll}
        />
        <PanelButton url="bg" label={backgroundColor ? "bg!" : "bg"}>
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <InputColor
              color={backgroundColor ?? "#000000"}
              onChange={(hex) => background.execute({ backgroundColor: hex })}
            />
            <PanelButton
              url="reset"
              disabled={!backgroundColor}
              onClick={() => background.execute({ backgroundColor: null })}
            />
          </div>
        </PanelButton>
        <PanelButton
          url="shad"
          label={shadowsEnabled ? "shad!" : "shad"}
          onClick={handleToggleShadows}
        />
        <InputProjectName />
      </div>
      <PanelButton url="q" onClick={() => console.log("q")} />
      <PanelButton url="ren" onClick={() => console.log("ren")} />
    </div>
  );
}
