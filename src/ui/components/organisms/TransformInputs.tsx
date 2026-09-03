import { useHandlers, useSceneEntities } from "@/app/ApplicationKernelContext";
import { useSceneStore } from "@/store/sceneStore";
import {
  CameraType,
  LightType,
  type ActiveEntity,
  type Transform,
} from "@/types/scene";
import { useCallback, useMemo } from "react";

import styles from "./TransformInputs.module.scss";
import clsx from "clsx";
import { NumberFieldInput } from "../molecules/inputs/NumberFieldInput";

export function activeEntityEditorHeading(active: ActiveEntity): string {
  switch (active.kind) {
    case "Mesh":
      return active.name?.trim() ? `mesh «${active.name}»` : "mesh";
    case "Light":
      return active.name;
    case "Camera":
      return active.type === CameraType.Perspective
        ? "Камера (перспектива)"
        : "Камера (ортография)";
    case "Group":
      return `group «${active.name}»`;
  }
}

export function TransformInputs({
  activeObj,
  isOpen,
}: {
  activeObj: ActiveEntity;
  isOpen: boolean;
}) {

  const { transform } = useHandlers();
  const scene = useSceneStore((s) => s.scene);
  const sceneId = scene?.id ?? null;

  if (!sceneId) return;

  const locked = activeObj.locked;

  const transformHandler = (
    type: keyof Transform,
    i: number,
    value: number
  ) => {
    const nextTuple = [...activeObj.transform[type]];
    nextTuple[i] = value;
    transform.execute({ objectRef: activeObj, [type]: nextTuple });
  };

  const activeObjTrans = activeObj.transform;
  const AXES = ["x", "y", "z"];

  const transforms = [];

  for (const transform in activeObjTrans) {
    const valueTransforms = [];
    if (activeObj.kind == "Camera" && transform == "scale") continue;
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
        [styles.hide]: !isOpen && true, //toDo: show when active BottomTools
      })}
      style={locked ? { opacity: "0.5" } : { opacity: "1" }}
    >
      {isOpen && (
        <h3 className="h3">
          Редактирование {activeEntityEditorHeading(activeObj)}
        </h3>
      )}
      {transforms}
    </div>
  );
}
