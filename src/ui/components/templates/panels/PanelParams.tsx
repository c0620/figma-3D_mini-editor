import { Panel } from "./BasePanel.tsx";
import styles from "./Panel.module.scss";
import { ScrollPanel } from "../../atoms/outputs/ScrollPanel.tsx";
import { MaterialParamsInputs } from "../../organisms/MaterialParamsInputs.tsx";
import { useSceneStore } from "@/store/sceneStore";
import { SelectIcon } from "../../atoms/inputs/Selects.tsx";
import type { ActiveEntity, MaterialID, SceneMesh } from "@/types/scene.ts";
import { threeAssetRegistry } from "@/store/threeAssetRegistry.ts";
import { MaterialPreview } from "../../atoms/sceneUtils/MaterialPreview.tsx";
import { useState } from "react";

export function PanelParams({ activeObj }: { activeObj: ActiveEntity }) {
  switch (activeObj.kind) {
    case "Mesh":
      const materials = threeAssetRegistry.getAssetData(
        activeObj.id
      )?.materials;
      if (materials)
        return (
          <MeshParams
            key={activeObj.id}
            activeMesh={activeObj}
            materialIDs={materials}
          />
        );
      return null;
    case "Camera":
      return (
        <Panel panel="Right" text="Параметры">
          <div>{activeObj.kind}</div>
        </Panel>
      );
    case "Light":
      return (
        <Panel panel="Right" text="Параметры">
          <div>{activeObj.id}</div>
        </Panel>
      );
  }
}

function MeshParams({
  materialIDs,
}: {
  activeMesh: SceneMesh;
  materialIDs: MaterialID[];
}) {
  const scene = useSceneStore();

  const [activeMaterialID, setActiveMaterialID] = useState<MaterialID>(
    materialIDs[0]
  );
  const activeMaterial = scene.scene!.materials[activeMaterialID];
  return (
    <Panel panel="Right" text="Параметры">
      <div className={styles.panelScene}>
        <ScrollPanel isLong={true} text="Материалы меша">
          {materialIDs.map((id) => (
            <MaterialPreview
              key={id}
              materialID={id}
              name={scene.scene!.materials[id].name}
              onClick={() => setActiveMaterialID(id)}
              isActive={id === activeMaterialID}
            />
          ))}
        </ScrollPanel>
      </div>
      <MaterialParamsInputs material={activeMaterial} />
      <div className={styles.panelScene}>
        <ScrollPanel isLong={true} text="Текстуры">
          <SelectIcon />
        </ScrollPanel>
      </div>
    </Panel>
  );
}
