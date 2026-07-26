import { useHandlers } from "@/app/ApplicationKernelContext";
import type { SceneEntitySummary } from "@/store/sceneEntityList";
import { useContext, useState } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { SmallButton } from "../../atoms/buttons/Button";

import styles from "./GraphItem.module.scss";

import mesh from "@/assets/images/icons/descriptive/mesh.svg?react";
import light from "@/assets/images/icons/descriptive/lighting.svg?react";
import camera from "@/assets/images/icons/descriptive/cameraP.svg?react";
import group from "@/assets/images/icons/descriptive/scene.svg?react";
import show from "@/assets/images/icons/state/visibilityOn.svg?react";
import hide from "@/assets/images/icons/state/visibilityOff.svg?react";
import lock from "@/assets/images/icons/state/lockOn.svg?react";
import free from "@/assets/images/icons/state/lockOff.svg?react";
import garb from "@/assets/images/icons/descriptive/garbage.svg?react";
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

  const ItemImg = (() => {
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
        key={i}
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
      {mode == "open" && (
        <div
          className={styles.dots}
          onClick={isParent ? onToggleBranch : undefined}
          role="button"
        >
          {dots}
        </div>
      )}
      <div className={styles.graphInfo} onClick={onSelect} role="button">
        <div
          className={clsx(styles.itemImage, {
            [styles.imageActive]: isActive,
            [styles.imageDisabled]:
              item.locked || (item.kind != "Camera" && !item.visible),
          })}
        >
          {ItemImg && <ItemImg />}
        </div>
        {mode == "open" && <p>{item.label}</p>}
      </div>

      {mode == "open" &&
        (isActive ||
          item.locked ||
          (item.kind != "Camera" && !item.visible)) && (
          <div
            className={clsx(styles.buttons, {
              [styles.buttonsSecondary]: !isActive,
            })}
          >
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
