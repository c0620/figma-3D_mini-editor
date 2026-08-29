import { useSceneEntities, useHandlers } from "@/app/ApplicationKernelContext";

import { Panel } from "./BasePanel";

import cameraSecIcon from "@/assets/images/icons/state/selectOff.svg?react";
import cameraPrimcon from "@/assets/images/icons/state/selectOn.svg?react";

import { TransformInputs } from "../../organisms/TransformInputs";
import styles from "./Panel.module.scss";
import type { ActiveEntity } from "@/types/scene";
import { SceneGraph } from "../../organisms/SceneGraph";
import { ActionButton } from "../../atoms/buttons/Button";
import { useSessionStore } from "@/store/sessionStore";
import { ObjectAddButton } from "../../molecules/buttons/ObjectAddButton";
import { PanelModeButton } from "../../molecules/buttons/PanelModeButton";

export function PanelScene({ activeObj }: { activeObj: ActiveEntity | null }) {
  const activeCameraID = useSessionStore((s) => s.activeCameraID);
  const setActiveCamera = useSessionStore((s) => s.setActiveCameraID);

  return (
    <Panel panel="Left" text="Сцена">
      <div className={styles.panelGroup}>
        <SceneGraph activeObj={activeObj} />
        <ObjectAddButton />
      </div>

      {activeObj && <TransformInputs activeObj={activeObj} />}
      {activeObj?.kind == "Camera" && (
        <PanelModeButton
          text={
            activeCameraID == activeObj.id
              ? "Это главная камера"
              : "Назначить главной камерой"
          }
          onClick={() => setActiveCamera(activeObj.id)}
          img={activeCameraID == activeObj.id ? cameraPrimcon : cameraSecIcon}
          deactivated={activeCameraID == activeObj.id ? true : false}
        />
      )}
    </Panel>
  );
}
