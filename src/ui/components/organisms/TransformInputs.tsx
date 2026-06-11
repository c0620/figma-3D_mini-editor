import {
  useHandlers,
  useSceneEntities,
  type ActiveEntity,
} from "@/app/ApplicationKernelContext";
import { sceneCameraEntityId } from "@/store/sceneEntityList";
import { useSceneStore } from "@/store/sceneStore";
import type { Transform } from "@/types/scene";
import { useCallback, useContext, useMemo } from "react";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";

import styles from "./TransformInputs.module.scss";
import { InputText, type InputField } from "../atoms/inputs/TextInputs";
import clsx from "clsx";
import { NumberFieldInput } from "../molecules/inputs/NumberFieldInput";

export function activeEntityEditorHeading(active: ActiveEntity): string {
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

export function TransformInputs({ activeObj }: { activeObj: ActiveEntity }) {
  const mode = useContext(PanelSceneModeContext);

  const { base } = useHandlers();
  const scene = useSceneStore((s) => s.scene);
  const sceneId = scene?.id ?? null;

  if (!sceneId) return;

  var locked = isSelectionLocked(scene!, activeObj);

  const transformHandler = (
    type: keyof Transform,
    i: number,
    value: number
  ) => {
    var nextTuple = [...activeObj.data.transform[type]];
    nextTuple[i] = value;
    base.execute({ id: activeObj.id, [type]: nextTuple });
  };

  const activeObjTrans = activeObj.data.transform;
  const AXES = ["x", "y", "z"];

  const transforms = [];

  for (const transform in activeObjTrans) {
    var valueTransforms = [];
    for (const i in activeObjTrans[transform as keyof Transform]) {
      valueTransforms.push(
        <NumberFieldInput
          key={`${activeObj.id}-${transform}-${i}`}
          field={{
            value: activeObjTrans[transform as keyof Transform][i],
            isActive: false,
            onChange: (v: number) =>
              transformHandler(transform as keyof Transform, +i, v),
            label: AXES[i],
          }}
        />
      );
    }
    transforms.push(
      <div>
        <p className="t3">{transform}</p>
        <div
          className={clsx(styles.inputRow, {
            [styles.inactive]: activeObj.data.locked,
          })}
        >
          {valueTransforms}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(styles.baseParams, {
        [styles.hide]: mode == "close" && true, //toDo: show when active BottomTools
      })}
      style={locked ? { opacity: "0.5" } : { opacity: "1" }}
    >
      {mode == "open" && (
        <h3 className="h3">
          Редактирование {activeEntityEditorHeading(activeObj)}
        </h3>
      )}
      {transforms}
    </div>
  );
}
