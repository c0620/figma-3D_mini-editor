import {
  type ActiveEntity,
  useSceneEntities,
  useHandlers,
} from "@/app/ApplicationKernelContext";
import { sceneCameraEntityId } from "@/store/sceneEntityList";
import { useSceneStore } from "@/store/sceneStore";
import {
  useState,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { ActionButton } from "../../atoms/Button";
import { PanelModeToggle } from "../../atoms/Navigation";
import { ScrollPanel } from "../../atoms/Output";
import { GraphItem } from "../../atoms/SceneGraph";
import {
  ObjectNumberInput,
  PanelModeButtton,
  type InputField,
} from "../../atoms/EditorInput";
import type { Transform } from "@/types/scene";
import type { PanelMode } from "../../types/panel";
import { Panel, PanelSceneModeContext } from "./BasePanel";

import meshIcon from "@/assets/images/icons/descriptive/mesh.svg";
import lightIcon from "@/assets/images/icons/descriptive/lighting.svg";
import sceneIcon from "@/assets/images/icons/descriptive/scene.svg";

import { BaseParamsInputs } from "../../molecules/BaseParamsInputs";
import styles from "./Panel.module.scss";

/** Id строки дерева для выделения (совпадает с GraphItem.item.id). */
function activeEntityRowId(
  active: ActiveEntity | null,
  sceneId: string | null
): string | null {
  if (!active || !sceneId) return null;
  switch (active.kind) {
    case "mesh":
      return active.data.id;
    case "light":
      return active.data.id;
    case "camera":
      return sceneCameraEntityId(sceneId);
  }
}

export function PanelScene({ activeObj }: { activeObj: ActiveEntity | null }) {
  const scene = useSceneStore((s) => s.scene);
  const sceneItems = useSceneEntities();
  const sceneId = scene?.id ?? null;
  const { selection } = useHandlers();

  const activeRowId = useMemo(
    () => activeEntityRowId(activeObj, sceneId),
    [activeObj, sceneId]
  );

  return (
    <Panel panel="Left" text="Сцена">
      <div className={styles.panelScene}>
        <ScrollPanel
          text="Содержимое сцены"
          isActive={activeObj !== null}
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

        <PanelModeButtton
          onClick={() => console.log("add obj")}
          img={meshIcon}
          text="Добавить объект"
        />
        <PanelModeButtton
          onClick={() => console.log("add light")}
          img={lightIcon}
          text="Добавить свет"
        />
      </div>

      {activeObj && <BaseParamsInputs activeObj={activeObj} />}
    </Panel>
  );
}
