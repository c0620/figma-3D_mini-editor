import {
  type ActiveEntity,
  useSceneEntities,
  useHandlers,
} from "@/app/ApplicationKernelContext";

import { ScrollPanel } from "../../atoms/outputs/ScrollPanel";
import { GraphItem } from "../../atoms/sceneUtils/SceneGraph";
import { Panel } from "./BasePanel";

import meshIcon from "@/assets/images/icons/descriptive/mesh.svg";
import lightIcon from "@/assets/images/icons/descriptive/lighting.svg";
import sceneIcon from "@/assets/images/icons/descriptive/scene.svg";

import { TransformInputs } from "../../organisms/TransformInputs";
import styles from "./Panel.module.scss";
import { PanelModeButton } from "../../molecules/buttons/PanelModeButton";

export function PanelScene({ activeObj }: { activeObj: ActiveEntity | null }) {
  const sceneItems = useSceneEntities();
  const { selection } = useHandlers();

  const activeRowId = activeObj?.id ?? null;

  return (
    <Panel panel="Left" text="Сцена">
      <div className={styles.panelScene}>
        <ScrollPanel
          text="Содержимое сцены"
          isLong={activeObj === null} // add long if no active tool
          img={sceneIcon}
        >
          {sceneItems.map((item) => (
            <GraphItem
              key={item.id}
              item={item}
              isActive={item.id === activeRowId}
              onSelect={() =>
                item.id === activeRowId
                  ? selection.execute({ id: null })
                  : selection.execute({ id: item.id })
              }
            />
          ))}
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
