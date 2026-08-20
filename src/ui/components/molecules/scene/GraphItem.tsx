import { useHandlers } from "@/app/ApplicationKernelContext";
import type { SceneEntitySummary } from "@/store/sceneEntityList";
import { useContext, useState } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { SmallButton } from "../../atoms/buttons/Button";

import styles from "./GraphItem.module.scss";

import meshIcon from "@/assets/images/icons/descriptive/mesh.svg?react";
import lightIcon from "@/assets/images/icons/descriptive/lighting.svg?react";
import cameraIcon from "@/assets/images/icons/descriptive/cameraP.svg?react";
import groupIcon from "@/assets/images/icons/descriptive/scene.svg?react";
import showIcon from "@/assets/images/icons/state/visibilityOn.svg?react";
import hideIcon from "@/assets/images/icons/state/visibilityOff.svg?react";
import lockIcon from "@/assets/images/icons/state/lockOn.svg?react";
import freeIcon from "@/assets/images/icons/state/lockOff.svg?react";
import garbIcon from "@/assets/images/icons/descriptive/garbage.svg?react";
import inactiveIcon from "@/assets/images/icons/state/selectOff.svg?react";
import activeIcon from "@/assets/images/icons/state/selectOn.svg?react";
import clsx from "clsx";
import { useSessionStore } from "@/store/sessionStore";

export function GraphItem({
  item,
  isActive,
  isParent,
  isDisabled,
  onSelect,
  onToggleBranch,
  hidden,
  hideLock = false,
  hideDelete = false,
  ref,
}: {
  item: SceneEntitySummary;
  isActive: boolean;
  isDisabled: boolean;
  isParent: boolean;
  onSelect: () => void;
  onToggleBranch: () => void;
  hidden: boolean;
  hideLock?: boolean;
  hideDelete?: boolean;
  ref: React.RefObject<HTMLDivElement | null> | null;
}) {
  const mode = useContext(PanelSceneModeContext);

  const changeVisibilityHandler = useHandlers().visibility;
  const changeLockHandler = useHandlers().lock;
  const deleteHandler = useHandlers().deletion;

  const ItemImg = (() => {
    switch (item.kind) {
      case "Mesh":
        return meshIcon;
      case "Light":
        return lightIcon;
      case "Group":
        return groupIcon;
      case "Camera":
        return cameraIcon;
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
        [styles.textDisabled]: isDisabled,
        [styles.textActive]: isActive,
      })}
      ref={ref}
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
            [styles.imageDisabled]: isDisabled,
            [styles.imageActive]: isActive,
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
            {item.kind != "Camera" && (
              <SmallButton
                onClick={() => changeVisibilityHandler.execute({ id: item.id })}
                img={item.visible ? showIcon : hideIcon}
              />
            )}
            {!hideLock && (
              <SmallButton
                onClick={() => changeLockHandler.execute({ id: item.id })}
                img={item.locked ? freeIcon : lockIcon}
              />
            )}
            {!hideDelete && (
              <SmallButton
                onClick={() =>
                  deleteHandler.execute({
                    id: item.id,
                    isDelete: true,
                    kind: item.kind,
                  })
                }
                img={garbIcon}
              />
            )}
          </div>
        )}
    </div>
  );
}
