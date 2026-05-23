import { ActionButton } from "../atoms/Button";
import { ScrollPanel } from "../atoms/Output";
import { GraphItem } from "../atoms/SceneGraph";
import { PanelModeToggle } from "../atoms/Navigation";
import { createContext, useCallback, useMemo, useState } from "react";
import {
  useHandlers,
  useI18n,
  useSceneEntities,
  type ActiveEntity,
} from "@/app/ApplicationKernelContext";
import { sceneCameraEntityId } from "@/store/sceneEntityList";
import { useSceneStore } from "@/store/sceneStore";
import { ObjectNumberInput, type InputField } from "../molecules/EditorInput";
import type { Transform } from "@/types/scene";

export type PanelMode = "open" | "close";

export const PanelSceneModeContext = createContext<PanelMode>("open");

const AXIS = ["x", "y", "z"] as const;

/** Id строки дерева для выделения (совпадает с GraphItem.item.id). */
function activeEntityRowId(
  active: ActiveEntity | null,
  sceneId: string | null
): string | null {
  if (!active || !sceneId) return null;
  switch (active.kind) {
    case "mesh":
      return active.data.id;
    case "light":
      return active.data.id;
    case "camera":
      return sceneCameraEntityId(sceneId);
  }
}

function activeEntityEditorHeading(
  active: ActiveEntity,
  t: ReturnType<typeof useI18n>["t"]
): string {
  switch (active.kind) {
    case "mesh":
      return active.data.name?.trim()
        ? `${t("entity.mesh.default")} «${active.data.name}»`
        : t("entity.mesh.default");
    case "light":
      return active.data.type === "Directional"
        ? t("entity.light.directional")
        : active.data.type === "Ambient"
          ? t("entity.light.ambient")
          : t("entity.light.hdri");
    case "camera":
      return active.data.type === "Perspective"
        ? t("entity.camera.perspective")
        : t("entity.camera.orthographic");
  }
}

/** Актуальный transform для выделения из стора. */
function transformForSelection(
  scene: NonNullable<ReturnType<typeof useSceneStore.getState>["scene"]>,
  active: ActiveEntity
): Transform | null {
  switch (active.kind) {
    case "mesh": {
      const o = scene.meshes.find((x) => x.id === active.data.id);
      return o?.transform ?? null;
    }
    case "light": {
      const l = scene.lights.find((x) => x.id === active.data.id);
      return l?.transform ?? null;
    }
    case "camera":
      return scene.camera.transform;
  }
}

function isSelectionLocked(
  scene: NonNullable<ReturnType<typeof useSceneStore.getState>["scene"]>,
  active: ActiveEntity
): boolean {
  switch (active.kind) {
    case "mesh":
      return scene.meshes.find((o) => o.id === active.data.id)?.locked ?? false;
    case "light":
      return scene.lights.find((l) => l.id === active.data.id)?.locked ?? false;
    case "camera":
      return scene.camera.locked;
  }
}

function buildAxisFields(
  key: keyof Transform,
  tuple: [number, number, number],
  onAxis: (
    dimension: keyof Transform,
    axisIdx: 0 | 1 | 2,
    value: number
  ) => void,
  locked: boolean
): InputField[] {
  return ([0, 1, 2] as const).map((i) => ({
    label: AXIS[i],
    value: tuple[i],
    isActive: false,
    onChange: (value: number) => {
      if (!locked) onAxis(key, i, value);
    },
  }));
}

export function PanelScene({ activeObj }: { activeObj: ActiveEntity | null }) {
  const [mode, setMode] = useState<PanelMode>("open");
  const scene = useSceneStore((s) => s.scene);
  const { t } = useI18n();

  const sceneItems = useSceneEntities();
  const sceneId = scene?.id ?? null;
  const { selection, base } = useHandlers();

  const activeRowId = useMemo(
    () => activeEntityRowId(activeObj, sceneId),
    [activeObj, sceneId]
  );

  const applyTransformDimension = useCallback(
    (dimensionKey: keyof Transform, axisIndex: 0 | 1 | 2, value: number) => {
      const snapshot = useSceneStore.getState().scene;
      if (!snapshot || !activeObj || !sceneId) return;
      const rowId =
        activeObj.kind === "camera"
          ? sceneCameraEntityId(sceneId)
          : activeObj.data.id;

      const cur = transformForSelection(snapshot, activeObj);
      if (!cur) return;

      const nextTuple = [...cur[dimensionKey]] as [number, number, number];
      nextTuple[axisIndex] = value;

      switch (dimensionKey) {
        case "position":
          base.execute({ id: rowId, position: nextTuple });
          break;
        case "rotation":
          base.execute({ id: rowId, rotation: nextTuple });
          break;
        case "scale":
          base.execute({ id: rowId, scale: nextTuple });
          break;
      }
    },
    [activeObj, sceneId, base]
  );

  const transformPanels = useMemo(() => {
    if (!scene || !activeObj || !sceneId) return null;

    const showTransformBlocks =
      activeObj.kind === "mesh" ||
      (activeObj.kind === "light" && activeObj.data.type !== "HDRI") ||
      activeObj.kind === "camera";

    if (!showTransformBlocks) return null;

    const transform = transformForSelection(scene, activeObj);
    if (!transform) return null;

    const locked = isSelectionLocked(scene, activeObj);

    const groups: {
      key: keyof Transform;
      labelKey: "transform.position" | "transform.rotation" | "transform.scale";
    }[] = [
      { key: "position", labelKey: "transform.position" },
      { key: "rotation", labelKey: "transform.rotation" },
      { key: "scale", labelKey: "transform.scale" },
    ];

    return (
      <>
        {locked ? (
          <div style={{ opacity: 0.85, marginBottom: 8 }}>
            {t("panel.scene.locked")}
          </div>
        ) : null}
        {groups.map(({ key: dim, labelKey }) => (
          <ObjectNumberInput
            key={dim}
            mode={mode}
            label={t(labelKey)}
            fields={buildAxisFields(
              dim,
              transform[dim],
              applyTransformDimension,
              locked
            )}
            sliderType={null}
          />
        ))}
      </>
    );
  }, [scene, activeObj, sceneId, mode, applyTransformDimension, t]);

  return (
    <div
      style={{
        background: "rgba(71, 71, 71, 0.33)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div>
        <PanelModeToggle mode={mode} setMode={setMode} />
        <PanelSceneModeContext.Provider value={mode}>
          <ScrollPanel>
            {sceneItems.map((item) => (
              <GraphItem
                key={item.id}
                item={item}
                isActive={item.id === activeRowId}
                onSelect={() =>
                  item.id === activeRowId
                    ? selection.execute({ id: null })
                    : selection.execute({ id: item.id })
                }
              />
            ))}
          </ScrollPanel>
          <ActionButton
            onClick={() => console.log("add obj")}
            text={t("panel.scene.addObject")}
          />
          <ActionButton
            onClick={() => console.log("add light")}
            text={t("panel.scene.addLight")}
          />

          {activeObj && (
            <div>
              <div>
                {t("panel.scene.editing")}{" "}
                <strong>{activeEntityEditorHeading(activeObj, t)}</strong>{" "}
              </div>
              <div>{transformPanels}</div>
            </div>
          )}
        </PanelSceneModeContext.Provider>
      </div>
    </div>
  );
}
