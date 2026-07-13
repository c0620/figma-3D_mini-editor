import { Panel } from "./BasePanel.tsx";
import styles from "./Panel.module.scss";
import { ScrollPanel } from "../../atoms/outputs/ScrollPanel.tsx";
import { MaterialParamsInputs } from "../../organisms/MaterialParamsInputs.tsx";
import { useSceneStore } from "@/store/sceneStore";
import { SelectIcon } from "../../atoms/inputs/Selects.tsx";
import type {
  ActiveEntity,
  MaterialID,
  SceneCamera,
  SceneGroup,
  SceneMesh,
} from "@/types/scene.ts";
import { TextureSlot } from "@/types/scene.ts";
import { threeAssetRegistry } from "@/store/threeAssetRegistry.ts";
import { MaterialPreview } from "../../atoms/scene/MaterialPreview.tsx";
import { useState } from "react";
import {
  TextureInput,
  TextureItem,
} from "../../molecules/inputs/TextureItem.tsx";
import { ModalMini } from "../../organisms/ModalTextureImport.tsx";
import { useSessionStore } from "@/store/sessionStore.ts";
import clsx from "clsx";
import materialsIcon from "@/assets/images/icons/descriptive/materials.svg?react";
import texturesIcon from "@/assets/images/icons/descriptive/texturesP.svg?react";

export function PanelParams({ activeObj }: { activeObj: ActiveEntity }) {
  switch (activeObj.kind) {
    case "Group":
      return <GroupParams activeGroup={activeObj} />;
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
      return <CameraParams activeCamera={activeObj} />;
    case "Light":
      return (
        <Panel panel="Right" text="Параметры">
          <div>{activeObj.id}</div>
        </Panel>
      );
  }
}

function GroupParams({ activeGroup }: { activeGroup: SceneGroup }) {
  const { scene } = useSceneStore();
  let graph = scene!.sceneGraph.graphThree;
  let groupChildren = graph[activeGroup.id];
  let childrenCount = 0;
  if (groupChildren) {
    childrenCount += groupChildren.length;
    let childrenStack = [...groupChildren];
    while (childrenStack && childrenStack.length != 0) {
      let currentChild = childrenStack.pop()!;
      let children = graph[currentChild];
      childrenCount += children.length;
      for (const child of children) {
        childrenStack.push(child);
      }
    }
  }
  return (
    <Panel panel="Right" text="Параметры">
      <div>{childrenCount}</div>
    </Panel>
  );
}

function MeshParams({
  materialIDs,
}: {
  activeMesh: SceneMesh;
  materialIDs: MaterialID[];
}) {
  const [activeMaterialID, setActiveMaterialID] = useState<MaterialID>(
    materialIDs[0]
  );

  const materials = useSceneStore((s) => s.scene?.materials);
  if (!materials) return <></>;

  const activeMaterial = materials[activeMaterialID];
  const activeThreeMaterial =
    threeAssetRegistry.materials[activeMaterialID].material;

  const [activeTextureSlot, setActiveTextureSlot] = useState<TextureSlot>(
    TextureSlot.BaseColor
  );

  const [openImportTextureModal, setOpenImportTextureModal] = useState(false);

  return (
    <>
      <Panel panel="Right" text="Параметры">
        <div className={clsx(styles.panelScene, styles.meshMaterials)}>
          <ScrollPanel isLong={true} text="Материалы меша" img={materialsIcon}>
            {materialIDs.map((id) => (
              <MaterialPreview
                key={id}
                materialID={id}
                name={materials[id].name}
                onClick={() => setActiveMaterialID(id)}
                isActive={id === activeMaterialID}
              />
            ))}
          </ScrollPanel>
        </div>
        <MaterialParamsInputs material={activeMaterial} />
        <div className={styles.panelScene}>
          <ScrollPanel isLong={true} text="Текстуры" img={texturesIcon}>
            {Object.values(TextureSlot).map((slot) => (
              <TextureItem
                key={slot}
                materialId={activeMaterialID}
                slot={slot}
                materialName={activeMaterial.name}
                texture={activeThreeMaterial[slot] ?? null}
                isActive={slot == activeTextureSlot}
                onClick={() => setActiveTextureSlot(slot)}
                openImportModal={() =>
                  setOpenImportTextureModal(!openImportTextureModal)
                }
              />
            ))}
          </ScrollPanel>
        </div>
      </Panel>
      <ModalMini
        open={openImportTextureModal}
        changeOpen={() => setOpenImportTextureModal(!openImportTextureModal)}
      >
        <TextureInput materialId={activeMaterialID} slot={activeTextureSlot} />
      </ModalMini>
    </>
  );
}

function CameraParams({ activeCamera }: { activeCamera: SceneCamera }) {
  const { activeCameraID } = useSessionStore();
  const isActive = activeCamera.id === activeCameraID;
  return (
    <Panel panel="Right" text="Параметры">
      <div className={styles.panelScene}>
        <ScrollPanel isLong={false} text="Тип камеры">
          <p>Перспективная</p>
          <p>Орт</p>
        </ScrollPanel>
      </div>
      <div>Параметры камеры (отд к)</div>
      <div>пресеты ракурсов камеры (отд к)</div>
    </Panel>
  );
}
