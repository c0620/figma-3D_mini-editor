import { useHandlers } from "@/app/ApplicationKernelContext";
import type { SceneEntitySummary } from "@/store/sceneEntityList";
import { useContext, useState } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { SmallButton } from "../../atoms/buttons/Button";

import styles from "./SceneItem.module.scss";

import mesh from "@/assets/images/icons/descriptive/mesh.svg";
import light from "@/assets/images/icons/descriptive/lighting.svg";
import camera from "@/assets/images/icons/descriptive/cameraP.svg";
import group from "@/assets/images/icons/descriptive/scene.svg";
import show from "@/assets/images/icons/state/visibilityOn.svg";
import hide from "@/assets/images/icons/state/visibilityOff.svg";
import lock from "@/assets/images/icons/state/lockOn.svg";
import free from "@/assets/images/icons/state/lockOff.svg";
import garb from "@/assets/images/icons/descriptive/garbage.svg";
import clsx from "clsx";

export function GraphItem({
  item,
  isActive,
  isParent,
  onSelect,
  onToggleBranch,
  hidden,
}: {
  item: SceneEntitySummary;
  isActive: boolean;
  isParent: boolean;
  onSelect: () => void;
  onToggleBranch: () => void;
  hidden: boolean;
}) {
  const mode = useContext(PanelSceneModeContext);

  const changeVisibilityHandler = useHandlers().visibility;
  const changeLockHandler = useHandlers().lock;
  const deleteHandler = useHandlers().deletion;

  const itemImg = (() => {
    switch (item.kind) {
      case "Mesh":
        return mesh;
      case "Light":
        return light;
      case "Group":
        return group;
      case "Camera":
        return camera;
    }
  })();

  const dots = [];

  for (var i = 0; i < item.level + 1; i++) {
    dots.push(
      <div
        className={clsx(styles.dot, {
          [styles.dotActive]: isActive,
          [styles.dotClosedActive]: isActive && hidden,
          [styles.dotClosed]: !isActive && hidden,
        })}
      />
    );
  }

  return (
    <div
      className={clsx(styles.sceneGraph, {
        [styles.textDisabled]: item.locked && !isActive,
        [styles.textActive]: isActive,
      })}
    >
      <div
        className={styles.dots}
        onClick={isParent ? onToggleBranch : undefined}
      >
        {dots}
      </div>
      <div className={styles.graphInfo} onClick={onSelect}>
        <div
          className={clsx(styles.itemImage, {
            [styles.imageActive]: isActive,
            [styles.imageDisabled]:
              item.locked || (item.kind != "Camera" && !item.visible),
          })}
        >
          <img alt={item.kind} src={itemImg} />
        </div>
        {mode == "open" && <p>{item.label}</p>}
      </div>

      {mode == "open" &&
        (isActive ||
          item.locked ||
          (item.kind != "Camera" && !item.visible)) && (
          <div className={styles.buttons}>
            <SmallButton
              onClick={() => changeVisibilityHandler.execute({ id: item.id })}
              img={item.kind != "Camera" && item.visible ? show : hide}
            />
            <SmallButton
              onClick={() => changeLockHandler.execute({ id: item.id })}
              img={item.locked ? free : lock}
            />
            <SmallButton
              onClick={() =>
                deleteHandler.execute({
                  id: item.id,
                  isDelete: true,
                  kind: item.kind,
                })
              }
              img={garb}
            />
          </div>
        )}
    </div>
  );
}
