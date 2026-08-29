import { Panel } from "./BasePanel.tsx";
import styles from "./Panel.module.scss";
import { ScrollPanel } from "../../atoms/outputs/ScrollPanel.tsx";
import { MaterialParamsInputs } from "../../organisms/params/MaterialParamsInputs.tsx";
import { useSceneStore } from "@/store/sceneStore";
import type {
  ActiveEntity,
  MaterialID,
  SceneCamera,
  SceneGroup,
  SceneLight,
  SceneMesh,
} from "@/types/scene.ts";
import { CameraType, LightType, TextureSlot } from "@/types/scene.ts";
import { threeAssetRegistry } from "@/store/threeAssetRegistry.ts";
import { MaterialPreview } from "../../atoms/scene/MaterialPreview.tsx";
import { useState } from "react";
import {
  TextureInput,
  TextureItem,
} from "../../molecules/inputs/TextureItem.tsx";
import { ModalMini } from "../../organisms/ModalTextureImport.tsx";
import clsx from "clsx";
import materialsIcon from "@/assets/images/icons/descriptive/materials.svg?react";
import texturesIcon from "@/assets/images/icons/descriptive/texturesP.svg?react";
import perspectiveCameraIcon from "@/assets/images/icons/descriptive/cameraP.svg?react";
import orthographicCameraIcon from "@/assets/images/icons/descriptive/cameraO.svg?react";
import lensIcon from "@/assets/images/icons/descriptive/lens.svg?react";
import ambientLightIcon from "@/assets/images/icons/descriptive/lighting.svg?react";
import pointLightIcon from "@/assets/images/icons/descriptive/pointLight.svg?react";
import spotLightIcon from "@/assets/images/icons/descriptive/spotLight.svg?react";

import { CameraParamsInputs } from "../../organisms/params/CameraParamsInputs.tsx";
import { SwitchItem } from "../../molecules/inputs/SwitchItem.tsx";
import { RadioCameraAnglePresets } from "../../molecules/inputs/radio/RadioCameraAnglePresets.tsx";
import { useHandlers } from "@/app/ApplicationKernelContext.tsx";
import { LightParamsInputs } from "../../organisms/params/LightParamsInputs.tsx";
import { RadioLightPresets } from "../../molecules/inputs/radio/RadioLightPresets.tsx";

export function PanelParams({ activeObj }: { activeObj: ActiveEntity }) {
  switch (activeObj.kind) {
    case "Group":
      return <GroupParams activeGroup={activeObj} />;
    case "Mesh": {
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
    }
    case "Camera":
      return <CameraParams activeCamera={activeObj} />;
    case "Light":
      return <LightParams activeLight={activeObj} />;
  }
}

function LightParams({ activeLight }: { activeLight: SceneLight }) {
  const { lightEditing } = useHandlers();
  return (
    <Panel panel="Right" text="Параметры">
      <ScrollPanel
        text="Вид источника света"
        img={
          activeLight.type == LightType.Ambient
            ? ambientLightIcon
            : activeLight.type == LightType.Point
              ? pointLightIcon
              : spotLightIcon
        }
      >
        <SwitchItem
          text="Окружающий свет"
          icon={ambientLightIcon}
          onClick={() =>
            lightEditing.execute({
              id: activeLight.id,
              changes: { type: LightType.Ambient },
            })
          }
          isActive={activeLight.type == LightType.Ambient}
        />
        <SwitchItem
          text="Точечный свет"
          icon={pointLightIcon}
          onClick={() =>
            lightEditing.execute({
              id: activeLight.id,
              changes: { type: LightType.Point },
            })
          }
          isActive={activeLight.type == LightType.Point}
        />
        <SwitchItem
          text="Направленный свет"
          icon={spotLightIcon}
          onClick={() =>
            lightEditing.execute({
              id: activeLight.id,
              changes: { type: LightType.Spot },
            })
          }
          isActive={activeLight.type == LightType.Spot}
        />
      </ScrollPanel>
      <div className={styles.panelSet}>
        <LightParamsInputs activeLight={activeLight} />
        {activeLight.type == LightType.Spot && (
          <RadioLightPresets
            title="Пресеты освещения"
            value={activeLight}
            onClick={(params) =>
              lightEditing.execute({ id: activeLight.id, changes: params })
            }
          />
        )}
      </div>
    </Panel>
  );
}

function GroupParams({ activeGroup }: { activeGroup: SceneGroup }) {
  const { scene } = useSceneStore();
  const graph = scene!.sceneGraph.graphThree;
  const groupChildren = graph[activeGroup.id];
  let childrenCount = 0;
  if (groupChildren) {
    childrenCount += groupChildren.length;
    const childrenStack = [...groupChildren];
    while (childrenStack.length != 0) {
      const currentChild = childrenStack.pop()!;
      const children = graph[currentChild];
      if (!children) continue;
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
        <ScrollPanel fill text="Материалы меша" img={materialsIcon}>
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

        <div className={styles.panelSet}>
          <MaterialParamsInputs material={activeMaterial} />

          <ScrollPanel text="Текстуры" img={texturesIcon}>
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
  const { camera } = useHandlers();
  return (
    <Panel panel="Right" text="Параметры">
      <ScrollPanel text="Тип камеры" img={lensIcon}>
        <SwitchItem
          text="Перспективная камера"
          icon={perspectiveCameraIcon}
          onClick={() =>
            camera.execute({
              id: activeCamera.id,
              type: CameraType.Perspective,
            })
          }
          isActive={activeCamera.type == CameraType.Perspective}
        />
        <SwitchItem
          text="Ортогональная камера"
          icon={orthographicCameraIcon}
          onClick={() =>
            camera.execute({
              id: activeCamera.id,
              type: CameraType.Orthographic,
            })
          }
          isActive={activeCamera.type == CameraType.Orthographic}
        />
      </ScrollPanel>
      <div className={styles.panelSet}>
        <CameraParamsInputs activeCamera={activeCamera} />
        <RadioCameraAnglePresets
          title="Пресеты вида камеры"
          value={{
            azimuth: activeCamera.azimuth,
            polar: activeCamera.polar,
            target: activeCamera.target,
          }}
          onClick={(value) =>
            camera.execute({
              id: activeCamera.id,
              azimuth: value.azimuth,
              polar: value.polar,
              target: value.target,
            })
          }
        />
      </div>
    </Panel>
  );
}
