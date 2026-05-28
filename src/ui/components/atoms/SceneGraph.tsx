import type { MouseEvent } from "react";
import { useHandlers } from "@/app/ApplicationKernelContext";
import type {
  SceneEntityKind,
  SceneEntitySummary,
} from "@/store/sceneEntityList";
import { useSceneStore } from "@/store/sceneStore";
import { usePanelCompact } from "../organisms/PanelScene";
import meshIcon from "@/assets/images/icons/descriptive/mesh.svg";
import ambientLightIcon from "@/assets/images/icons/descriptive/ambientLight.svg";
import spotLightIcon from "@/assets/images/icons/descriptive/spotLight.svg";
import hdrIcon from "@/assets/images/icons/descriptive/hdr.svg";
import cameraPIcon from "@/assets/images/icons/descriptive/cameraP.svg";
import cameraOIcon from "@/assets/images/icons/descriptive/cameraO.svg";
import lockOffIcon from "@/assets/images/icons/state/lockOn.svg";
import lockOnIcon from "@/assets/images/icons/state/lockOff.svg";
import visibilityOnIcon from "@/assets/images/icons/state/visibilityOn.svg";
import visibilityOffIcon from "@/assets/images/icons/state/visibilityOff.svg";
import garbageIcon from "@/assets/images/icons/descriptive/garbage.svg";
import styles from "./SceneGraph.module.css";

function useEntityIcon(item: SceneEntitySummary): string {
  const scene = useSceneStore((s) => s.scene);
  if (item.kind === "mesh") return meshIcon;
  if (item.kind === "camera") {
    return scene?.camera.type === "Orthographic" ? cameraOIcon : cameraPIcon;
  }
  const light = scene?.lights.find((l) => l.id === item.id);
  if (light?.type === "Spot") return spotLightIcon;
  if (light?.type === "HDRI") return hdrIcon;
  return ambientLightIcon;
}

export function GraphItem({
  item,
  isActive,
  onSelect,
}: {
  item: SceneEntitySummary;
  isActive: boolean;
  onSelect: () => void;
}) {
  const compact = usePanelCompact();
  const icon = useEntityIcon(item);
  const changeVisibilityHandler = useHandlers().visibility;
  const changeLockHandler = useHandlers().lock;
  const deleteHandler = useHandlers().deletion;

  const isDimmed = item.locked || !item.visible;
  const showActions = !compact && (isActive || isDimmed);

  const stopClick = (e: MouseEvent) => e.stopPropagation();
  const rowClass = [
    styles.row,
    compact && styles.rowCompact,
    isActive && styles.rowActive,
    !isActive && isDimmed && styles.rowDimmed,
    !isActive && !isDimmed && styles.rowIdle,
  ]
    .filter(Boolean)
    .join(" ");
  const actionBtnClass = [
    styles.actionBtn,
    isActive && styles.actionBtnOnBlack,
    !isActive && isDimmed && styles.actionBtnOnPrimary,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClass} onClick={onSelect} title={compact ? item.label : undefined}>
      <span className={styles.iconWrap}>
        <img className={styles.icon} src={icon} alt="" />
      </span>
      {!compact ? (
        <span className={styles.label}>{item.label}</span>
      ) : null}
      {showActions && (
        <div className={styles.actions}>
          <button
            type="button"
            className={actionBtnClass}
            title={item.locked ? "Unlock" : "Lock"}
            onClick={(e) => {
              stopClick(e);
              changeLockHandler.execute({ id: item.id, type: item.kind });
            }}
          >
            <img src={item.locked ? lockOnIcon : lockOffIcon} alt="" />
          </button>
          {item.kind !== "camera" && (
            <>
              <button
                type="button"
                className={actionBtnClass}
                title={item.visible ? "Hide" : "Show"}
                onClick={(e) => {
                  stopClick(e);
                  changeVisibilityHandler.execute({
                    id: item.id,
                    type: item.kind as Exclude<SceneEntityKind, "camera">,
                  });
                }}
              >
                <img
                  src={item.visible ? visibilityOnIcon : visibilityOffIcon}
                  alt=""
                />
              </button>
              <button
                type="button"
                className={actionBtnClass}
                title="Delete"
                onClick={(e) => {
                  stopClick(e);
                  deleteHandler.execute({
                    modelId: item.id,
                    type: item.kind as Exclude<SceneEntityKind, "camera">,
                  });
                }}
              >
                <img src={garbageIcon} alt="" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
