import type { ActiveEntity } from "@/app/ApplicationKernelContext";
import { Panel } from "./BasePanel.tsx";
import styles from "./Panel.module.scss";
import { ScrollPanel } from "../../atoms/outputs/ScrollPanel.tsx";
import { MeshParamsInputs } from "../../organisms/MeshParamsInputs.tsx";
import { useSceneStore } from "@/store/sceneStore";
import { SelectIcon } from "../../atoms/inputs/Selects.tsx";

export function PanelParams({ activeObj }: { activeObj: ActiveEntity }) {
  const scene = useSceneStore();
  switch (activeObj.kind) {
    case "mesh":
      return (
        <Panel panel="Right" text="Параметры">
          <div className={styles.panelScene}>
            <ScrollPanel isLong={true} text="Материалы меша">
              {scene.scene!.materials[activeObj.data.materialId]!.baseColor}
            </ScrollPanel>
          </div>
          <MeshParamsInputs activeObj={activeObj} />
          <div className={styles.panelScene}>
            <ScrollPanel isLong={true} text="Текстуры">
              <SelectIcon />
            </ScrollPanel>
          </div>
        </Panel>
      );
    case "camera":
      return (
        <Panel panel="Right" text="Параметры">
          <div>{activeObj.data.type}</div>
        </Panel>
      );
    case "light":
      return (
        <Panel panel="Right" text="Параметры">
          <div>{activeObj.id}</div>
        </Panel>
      );
  }
}
