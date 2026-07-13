import { useHandlers, useSceneEntities } from "@/app/ApplicationKernelContext";
import { useSceneStore } from "@/store/sceneStore";
import type { ActiveEntity, Transform } from "@/types/scene";
import { useCallback, useContext, useMemo } from "react";
import { PanelSceneModeContext } from "../templates/panels/BasePanel";

import styles from "./TransformInputs.module.scss";
import clsx from "clsx";
import { NumberFieldInput } from "../molecules/inputs/NumberFieldInput";

export function activeEntityEditorHeading(active: ActiveEntity): string {
  switch (active.kind) {
    case "Mesh":
      return active.name?.trim() ? `mesh «${active.name}»` : "mesh";
    case "Light":
      return active.type === "Spot"
        ? "Направленный свет"
        : active.type === "Ambient"
          ? "Окружающий свет"
          : "HDRI";
    case "Camera":
      return active.type === "Perspective"
        ? "Камера (перспектива)"
        : "Камера (ортография)";
    case "Group":
      return `group «${active.name}»`;
  }
}

export function TransformInputs({ activeObj }: { activeObj: ActiveEntity }) {
  const mode = useContext(PanelSceneModeContext);

  const { transform } = useHandlers();
  const scene = useSceneStore((s) => s.scene);
  const sceneId = scene?.id ?? null;

  if (!sceneId) return;

  var locked = activeObj.locked;

  const transformHandler = (
    type: keyof Transform,
    i: number,
    value: number
  ) => {
    var nextTuple = [...activeObj.transform[type]];
    nextTuple[i] = value;
    transform.execute({ objectRef: activeObj, [type]: nextTuple });
  };

  const activeObjTrans = activeObj.transform;
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
      <div key={transform}>
        <p className="t3">{transform}</p>
        <div
          className={clsx(styles.inputRow, {
            [styles.inactive]: activeObj.locked,
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
