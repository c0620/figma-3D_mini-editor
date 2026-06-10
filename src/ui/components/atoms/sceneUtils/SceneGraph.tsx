import { useHandlers } from "@/app/ApplicationKernelContext";
import type { SceneEntitySummary } from "@/store/sceneEntityList";
import { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { SmallButton } from "../buttons/Button";

import styles from "./SceneGraph.module.scss";

import mesh from "@/assets/images/icons/descriptive/mesh.svg";
import light from "@/assets/images/icons/descriptive/lighting.svg";
import camera from "@/assets/images/icons/descriptive/cameraP.svg";
import show from "@/assets/images/icons/state/visibilityOn.svg";
import hide from "@/assets/images/icons/state/visibilityOff.svg";
import lock from "@/assets/images/icons/state/lockOn.svg";
import free from "@/assets/images/icons/state/lockOff.svg";
import garb from "@/assets/images/icons/descriptive/garbage.svg";
import clsx from "clsx";

export function GraphItem({
  item,
  isActive,
  onSelect,
}: {
  item: SceneEntitySummary;
  isActive: boolean;
  onSelect: () => void;
}) {
  const mode = useContext(PanelSceneModeContext);

  const changeVisibilityHandler = useHandlers().visibility;
  const changeLockHandler = useHandlers().lock;
  const deleteHandler = useHandlers().deletion;

  var itemImg;
  switch (item.kind) {
    case "mesh":
      itemImg = mesh;
      break;
    case "light":
      itemImg = light;
      break;
    case "camera":
      itemImg = camera;
      break;
  }

  return (
    <div
      className={clsx(styles.sceneGraph, {
        [styles.textDisabled]: item.locked && !isActive,
        [styles.textActive]: isActive,
      })}
    >
      <div className={styles.graphInfo} onClick={onSelect}>
        <div
          className={clsx(styles.itemImage, {
            [styles.imageActive]: isActive,
            [styles.imageDisabled]: item.locked || !item.visible,
          })}
        >
          <img alt={item.kind} src={itemImg} />
        </div>
        {mode == "open" && <p>{item.label}</p>}
      </div>

      {mode == "open" && (isActive || item.locked || !item.visible) && (
        <div className={styles.buttons}>
          <SmallButton
            onClick={() => changeVisibilityHandler.execute({ id: item.id })}
            img={item.visible ? show : hide}
          />
          <SmallButton
            onClick={() => changeLockHandler.execute({ id: item.id })}
            img={item.locked ? free : lock}
          />
          <SmallButton
            onClick={() => deleteHandler.execute({ modelId: item.id })}
            img={garb}
          />
        </div>
      )}
    </div>
  );
}
