import {
  useHandlers,
  useSceneEntities,
  type ActiveEntity,
} from "@/app/ApplicationKernelContext";
import { sceneCameraEntityId } from "@/store/sceneEntityList";
import { useSceneStore } from "@/store/sceneStore";
import type { Transform } from "@/types/scene";
import { useCallback, useContext, useMemo } from "react";
import { ObjectNumberInput, type InputField } from "../atoms/EditorInput";
import { PanelSceneModeContext } from "../organisms/panels/BasePanel";

import style from "./BaseParamsInputs.module.scss";

const AXIS = ["x", "y", "z"] as const;

function activeEntityEditorHeading(active: ActiveEntity): string {
  switch (active.kind) {
    case "mesh":
      return active.data.name?.trim() ? `mesh «${active.data.name}»` : "mesh";
    case "light":
      return active.data.type === "Directional"
        ? "Направленный свет"
        : active.data.type === "Ambient"
          ? "Окружающий свет"
          : "HDRI";
    case "camera":
      return active.data.type === "Perspective"
        ? "Камера (перспектива)"
        : "Камера (ортография)";
  }
}

/** Актуальный transform для выделения из стора. */
function transformForSelection(
  scene: NonNullable<ReturnType<typeof useSceneStore.getState>["scene"]>,
  active: ActiveEntity
): Transform | null {
  switch (active.kind) {
    case "mesh": {
      const o = scene.objects.find((x) => x.id === active.data.id);
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

function isSelectionLocked(
  scene: NonNullable<ReturnType<typeof useSceneStore.getState>["scene"]>,
  active: ActiveEntity
): boolean {
  switch (active.kind) {
    case "mesh":
      return (
        scene.objects.find((o) => o.id === active.data.id)?.locked ?? false
      );
    case "light":
      return scene.lights.find((l) => l.id === active.data.id)?.locked ?? false;
    case "camera":
      return scene.camera.locked;
  }
}

export function BaseParamsInputs({ activeObj }: { activeObj: ActiveEntity }) {
  const { base } = useHandlers();
  const scene = useSceneStore((s) => s.scene);
  const sceneId = scene?.id ?? null;
  const mode = useContext(PanelSceneModeContext);

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

  var locked = isSelectionLocked(scene!, activeObj);

  const transformPanels = useMemo(() => {
    if (!scene || !activeObj || !sceneId) return null;

    const showTransformBlocks =
      activeObj.kind === "mesh" ||
      (activeObj.kind === "light" && activeObj.data.type !== "HDRI") ||
      activeObj.kind === "camera";

    if (!showTransformBlocks) return null;

    const t = transformForSelection(scene, activeObj);
    if (!t) return null;

    locked = isSelectionLocked(scene!, activeObj);

    const groups: { key: keyof Transform; ru: string }[] = [
      { key: "position", ru: "Позиционирование" },
      { key: "rotation", ru: "Поворот" },
      { key: "scale", ru: "Масштабирование" },
    ];

    return (
      <>
        {groups.map(({ key: dim, ru }) => (
          <ObjectNumberInput
            key={dim}
            mode={mode}
            groupLabel={ru}
            fields={buildAxisFields(
              dim,
              t[dim],
              applyTransformDimension,
              locked
            )}
            sliderType={null}
          />
        ))}
      </>
    );
  }, [scene, mode, activeObj, sceneId, applyTransformDimension]);

  return (
    <div
      className={style.baseParams}
      style={locked ? { opacity: "0.5" } : { opacity: "1" }}
    >
      {mode == "open" && (
        <h3 className="h3">
          Редактирование {activeEntityEditorHeading(activeObj)}
        </h3>
      )}
      {transformPanels}
    </div>
  );
}
