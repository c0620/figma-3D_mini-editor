import { PanelCtaButton } from "../atoms/Button";
import { useSessionStore } from "@/store/sessionStore";
import panelStyles from "./PanelScene.module.css";
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
import { activeZoom } from "@/types/scene";
import { createDefaultLight } from "@/lights/lightDefaults";
import { randomUUID } from "@/lib/randomId";
import {
  isSelectionLocked,
  isTransformEditable,
} from "@/lib/transformSelection";

export type PanelMode = "openL" | "closeL" | "openR" | "closeR";

export const PanelSceneModeContext = createContext<PanelMode>("openL");

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
      return active.data.type === "Ambient"
        ? t("entity.light.ambient")
        : active.data.type === "Spot"
          ? t("entity.light.spot")
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

function buildAxisFields(
  key: keyof Transform,
  tuple: [number, number, number],
  onAxis: (
    dimension: keyof Transform,
    axisIdx: 0 | 1 | 2,
    value: number
  ) => void,
  locked: boolean,
  highlight: boolean
): InputField[] {
  return ([0, 1, 2] as const).map((i) => ({
    label: AXIS[i],
    value: tuple[i],
    isActive: highlight,
    onChange: (value: number) => {
      if (!locked) onAxis(key, i, value);
    },
  }));
}

export function PanelScene({ activeObj }: { activeObj: ActiveEntity | null }) {
  const [mode, setMode] = useState<PanelMode>("openL");
  const scene = useSceneStore((s) => s.scene);
  const transformToolMode = useSessionStore((s) => s.transformToolMode);
  const { t } = useI18n();

  const sceneItems = useSceneEntities();
  const sceneId = scene?.id ?? null;
  const {
    selection,
    transform,
    camera: cameraHandler,
    lightAddition,
  } = useHandlers();

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
          transform.execute({ id: rowId, position: nextTuple });
          break;
        case "rotation":
          transform.execute({ id: rowId, rotation: nextTuple });
          break;
        case "scale":
          transform.execute({ id: rowId, scale: nextTuple });
          break;
      }
    },
    [activeObj, sceneId, transform]
  );

  const transformPanels = useMemo(() => {
    if (!scene || !activeObj || !sceneId) return null;

    if (!isTransformEditable(activeObj)) return null;

    const transform = transformForSelection(scene, activeObj);
    if (!transform) return null;

    const locked = isSelectionLocked(scene, activeObj);

    const groups: {
      key: keyof Transform;
      labelKey: "transform.position" | "transform.rotation" | "transform.scale";
    }[] =
      activeObj.kind === "camera"
        ? [
            { key: "position", labelKey: "transform.position" },
            { key: "rotation", labelKey: "transform.rotation" },
          ]
        : [
            { key: "position", labelKey: "transform.position" },
            { key: "rotation", labelKey: "transform.rotation" },
            { key: "scale", labelKey: "transform.scale" },
          ];

    return (
      <>
        {locked ? (
          <div className={panelStyles.lockedNotice}>
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
              locked,
              dim === "scale" && transformToolMode === "scale"
            )}
            sliderType={null}
          />
        ))}
        {activeObj.kind === "camera" && (
          <ObjectNumberInput
            mode={mode}
            label={t("camera.zoom")}
            sliderType="default"
            fields={[
              {
                value: activeZoom(scene.camera),
                isActive: false,
                min: 0.01,
                max: scene.camera.type === "Perspective" ? 10 : 100,
                step: 0.01,
                onChange: (value) => {
                  if (!locked) {
                    cameraHandler.execute(
                      scene.camera.type === "Perspective"
                        ? { perspectiveZoom: value }
                        : { orthographicZoom: value }
                    );
                  }
                },
              },
            ]}
          />
        )}
      </>
    );
  }, [
    scene,
    activeObj,
    sceneId,
    mode,
    applyTransformDimension,
    t,
    cameraHandler,
    transformToolMode,
  ]);

  const isOpen = mode === "openL" || mode === "openR";

  return (
    <div className="panel-container panel-container--editor">
      <div className="panel-header">
        <PanelModeToggle mode={mode} setMode={setMode} />
        {isOpen ? (
          <div className="panel-header-title">
            <h2>{t("panel.scene.title")}</h2>
          </div>
        ) : null}
      </div>
      <h3>{t("panel.scene.content")}</h3>
      <PanelSceneModeContext.Provider value={mode}>
        <div className="panel-scene-body">
          <ScrollPanel variant="graph" fillAvailable={activeObj == null}>
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
          {isOpen ? (
            <div className="panel-actions">
              <PanelCtaButton
                text={t("panel.scene.addObject")}
                onClick={() => console.log("add obj")}
              />
              <PanelCtaButton
                text={t("panel.scene.addLight")}
                onClick={() => {
                  const id = randomUUID();
                  lightAddition.execute(createDefaultLight({ id }));
                  selection.execute({ id });
                }}
              />
            </div>
          ) : null}

          {activeObj && isOpen ? (
            <div className="panel-section">
              <h3 className={panelStyles.editingHeading}>
                {t("panel.scene.editing")}{" "}
                <span className={panelStyles.editingName}>
                  {activeEntityEditorHeading(activeObj, t)}
                </span>
              </h3>
              {transformPanels}
            </div>
          ) : null}
        </div>
      </PanelSceneModeContext.Provider>
    </div>
  );
}
