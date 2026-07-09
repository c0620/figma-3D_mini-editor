import { useSceneEntities, useHandlers } from "@/app/ApplicationKernelContext";

import { ScrollPanel } from "../../atoms/outputs/ScrollPanel";
import { Panel } from "./BasePanel";

import meshIcon from "@/assets/images/icons/descriptive/mesh.svg";
import lightIcon from "@/assets/images/icons/descriptive/lighting.svg";
import sceneIcon from "@/assets/images/icons/descriptive/scene.svg";

import { TransformInputs } from "../../organisms/TransformInputs";
import styles from "./Panel.module.scss";
import { PanelModeButton } from "../../molecules/buttons/PanelModeButton";
import type { ActiveEntity } from "@/types/scene";
import { SceneGraph } from "../../organisms/SceneGraph";

export function PanelScene({ activeObj }: { activeObj: ActiveEntity | null }) {
  return (
    <Panel panel="Left" text="Сцена">
      <div className={styles.panelScene}>
        <ScrollPanel
          text="Содержимое сцены"
          isLong={activeObj === null} // add long if no active tool
          img={sceneIcon}
        >
          <SceneGraph activeObj={activeObj} />
        </ScrollPanel>

        <PanelModeButton
          onClick={() => console.log("add obj")}
          img={meshIcon}
          text="Добавить объект"
        />
        <PanelModeButton
          onClick={() => console.log("add light")}
          img={lightIcon}
          text="Добавить свет"
        />
      </div>

      {activeObj && <TransformInputs activeObj={activeObj} />}
    </Panel>
  );
}
