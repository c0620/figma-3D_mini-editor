import type {
  CameraState,
  Light,
  Material,
  SceneMesh,
  TextureSlot,
} from "@/types/scene";
import {
  buildApplySavedCameraViewPatch,
  buildSaveCameraViewPatch,
  buildStandardCameraPresetPatch,
  STANDARD_CAMERA_PRESETS,
} from "@/camera/cameraPresets";
import { ScrollPanel } from "../atoms/Output";
import {
  useActiveMeshMaterials,
  useHandlers,
  useI18n,
} from "@/app/ApplicationKernelContext";
import { useSceneStore } from "@/store/sceneStore";
import type { CameraPatch, LightPatch } from "@/store/sceneStore";
import type { LightType } from "@/types/scene";
import type { TranslationKey } from "@/i18n/en";
import { HDRI_PRESETS } from "@/lights/hdriPresets";
import {
  buildSpotLightPositionPresetPatch,
  SPOT_LIGHT_POSITION_PRESETS,
} from "@/lights/spotLightPresets";

import { useEffect, useMemo, useState } from "react";
import {
  HdriPreviewThumb,
  MaterialPreviewThumb,
  TexturePreviewThumb,
} from "../molecules/ScenePreviews";
import { ObjectNumberInput } from "../molecules/EditorInput";
import type { PanelMode } from "./PanelScene";
import { InputColor } from "../atoms/Input";
import { ActionButton } from "../atoms/Button";

export function PanelMesh({ mesh }: { mesh: SceneMesh }) {
  void mesh;
  const materials = useActiveMeshMaterials();
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [mode, setMode] = useState<PanelMode>("open");
  const { materialEditing } = useHandlers();

  const activeMaterial = materials ? materials[activeMaterialIndex] : null;
  const activeTextures = activeMaterial ? activeMaterial.textures : null;
  const [activeTextureName, setActiveTextureName] = useState(
    activeTextures
      ? Object.entries(activeTextures).find(([, val]) => val != null)?.[0]
      : null
  );

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div>
        <p>Материалы меша</p>
        <ScrollPanel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {materials?.map((m, id) => (
              <MaterialPreviewThumb
                key={m.id}
                material={m}
                isActive={id === activeMaterialIndex}
                onClick={() => setActiveMaterialIndex(id)}
              />
            ))}
          </div>
        </ScrollPanel>
        {activeMaterial && (
          <>
            <div>
              <p>Параметры {activeMaterial.name}</p>
              <ObjectNumberInput
                mode={mode}
                fields={[
                  {
                    onChange: (field) =>
                      materialEditing.execute({
                        id: activeMaterial.id,
                        changes: { roughness: field },
                      }),
                    isActive: false,
                    value: activeMaterial.roughness,
                  },
                ]}
                label="Шероховатость"
                sliderType="default"
              />
              <ObjectNumberInput
                mode={mode}
                fields={[
                  {
                    onChange: (field) =>
                      materialEditing.execute({
                        id: activeMaterial.id,
                        changes: { metalness: field },
                      }),
                    isActive: false,
                    value: activeMaterial.metalness,
                  },
                ]}
                label="Блеск"
                sliderType="default"
              />
              <ObjectNumberInput
                mode={mode}
                fields={[
                  {
                    onChange: (field) =>
                      materialEditing.execute({
                        id: activeMaterial.id,
                        changes: { emissiveIntensity: field },
                      }),
                    isActive: false,
                    value: +activeMaterial.emissiveIntensity,
                  },
                ]}
                label="Сила свечения"
                sliderType="default"
              />
              <InputColor
                color={activeMaterial.baseColor}
                onChange={(color) =>
                  materialEditing.execute({
                    id: activeMaterial.id,
                    changes: { baseColor: color },
                  })
                }
              />
            </div>
            <div>
              <p>Текстуры {activeMaterial.name}</p>
              {(Object.keys(activeMaterial.textures) as TextureSlot[]).map(
                (key) =>
                  activeMaterial.textures[key] && (
                    <TexturePreviewThumb
                      materialID={activeMaterial.id}
                      isActive={activeTextureName === key}
                      name={key}
                      url={activeMaterial.textures[key]?.url}
                      onClick={() => setActiveTextureName(key)}
                    />
                  )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PanelCamera(_props: { camera: CameraState }) {
  void _props;
  const camera = useSceneStore((s) => s.scene?.camera);
  const [mode] = useState<PanelMode>("open");
  const { camera: cameraHandler } = useHandlers();
  const { t } = useI18n();

  if (!camera) return null;

  const locked = camera.locked;

  const patch = (changes: CameraPatch) => {
    if (locked) return;
    cameraHandler.execute(changes);
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div>
        <p>{t("panel.scene.editing")}</p>
        {locked ? (
          <div style={{ opacity: 0.85, marginBottom: 8 }}>
            {t("panel.scene.locked")}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <ActionButton
            text={t("camera.type.perspective")}
            onClick={() => patch({ type: "Perspective" })}
          />
          <ActionButton
            text={t("camera.type.orthographic")}
            onClick={() => patch({ type: "Orthographic" })}
          />
        </div>
        <ObjectNumberInput
          mode={mode}
          label={t("camera.near")}
          sliderType={null}
          fields={[
            {
              value: camera.near,
              isActive: false,
              onChange: (value) => patch({ near: value }),
            },
          ]}
        />
        <ObjectNumberInput
          mode={mode}
          label={t("camera.far")}
          sliderType={null}
          fields={[
            {
              value: camera.far,
              isActive: false,
              onChange: (value) => patch({ far: value }),
            },
          ]}
        />
        <ObjectNumberInput
          mode={mode}
          label={t("camera.aspect")}
          sliderType={null}
          fields={[
            {
              value: camera.aspect,
              isActive: false,
              onChange: (value) => patch({ aspect: value }),
            },
          ]}
        />
        <ActionButton
          text={
            camera.aspectPreviewEnabled
              ? t("camera.aspectPreview.on")
              : t("camera.aspectPreview.off")
          }
          onClick={() =>
            patch({ aspectPreviewEnabled: !camera.aspectPreviewEnabled })
          }
        />
        {camera.type === "Perspective" && (
          <ObjectNumberInput
            mode={mode}
            label={t("camera.fov")}
            sliderType="default"
            fields={[
              {
                value: camera.fov,
                isActive: false,
                onChange: (value) => patch({ fov: value }),
              },
            ]}
          />
        )}
        <p style={{ marginTop: 12 }}>{t("camera.presets")}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {STANDARD_CAMERA_PRESETS.map((preset) => (
            <ActionButton
              key={preset}
              text={t(`camera.preset.${preset}`)}
              onClick={() =>
                patch(buildStandardCameraPresetPatch(camera, preset))
              }
            />
          ))}
          {camera.savedView ? (
            <ActionButton
              text={t("camera.preset.saved")}
              onClick={() => {
                const savedPatch = buildApplySavedCameraViewPatch(camera);
                if (savedPatch) patch(savedPatch);
              }}
            />
          ) : null}
        </div>
        <ActionButton
          text={t("camera.preset.saveCurrent")}
          onClick={() => patch(buildSaveCameraViewPatch(camera))}
        />
      </div>
    </div>
  );
}

export function PanelLight({ light }: { light: Light }) {
  const liveLight =
    useSceneStore((s) => s.scene?.lights.find((l) => l.id === light.id)) ?? light;
  const [mode] = useState<PanelMode>("open");
  const { lightEditing } = useHandlers();
  const { t } = useI18n();

  const locked = liveLight.locked;

  const patch = (changes: LightPatch) => {
    if (locked) return;
    lightEditing.execute({ id: liveLight.id, changes });
  };

  const lightTypes: LightType[] = ["Ambient", "Spot", "HDRI"];
  const lightTypeLabel: Record<LightType, TranslationKey> = {
    Ambient: "light.type.ambient",
    Spot: "light.type.spot",
    HDRI: "light.type.hdri",
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div>
        <p>{t("panel.scene.editing")}</p>
        {locked ? (
          <div style={{ opacity: 0.85, marginBottom: 8 }}>
            {t("panel.scene.locked")}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {lightTypes.map((type) => (
            <ActionButton
              key={type}
              text={t(lightTypeLabel[type])}
              onClick={() => patch({ type })}
            />
          ))}
        </div>

        {liveLight.type === "Ambient" && (
          <>
            <ObjectNumberInput
              mode={mode}
              label={t("light.intensity")}
              sliderType="default"
              fields={[
                {
                  value: liveLight.intensity,
                  isActive: false,
                  onChange: (value) => patch({ intensity: value }),
                },
              ]}
            />
            <InputColor
              color={liveLight.color}
              onChange={(color) => patch({ color })}
            />
          </>
        )}

        {liveLight.type === "Spot" && (
          <>
            <ObjectNumberInput
              mode={mode}
              label={t("light.intensity")}
              sliderType="default"
              fields={[
                {
                  value: liveLight.intensity,
                  isActive: false,
                  onChange: (value) => patch({ intensity: value }),
                },
              ]}
            />
            <ObjectNumberInput
              mode={mode}
              label={t("light.distance")}
              sliderType="default"
              fields={[
                {
                  value: liveLight.distance,
                  isActive: false,
                  onChange: (value) => patch({ distance: value }),
                },
              ]}
            />
            <ObjectNumberInput
              mode={mode}
              label={t("light.penumbra")}
              sliderType="default"
              fields={[
                {
                  value: liveLight.penumbra,
                  isActive: false,
                  onChange: (value) => patch({ penumbra: value }),
                },
              ]}
            />
            <ObjectNumberInput
              mode={mode}
              label={t("light.angle")}
              sliderType="default"
              fields={[
                {
                  value: liveLight.angle,
                  isActive: false,
                  onChange: (value) => patch({ angle: value }),
                },
              ]}
            />
            <InputColor
              color={liveLight.color}
              onChange={(color) => patch({ color })}
            />
            <p style={{ marginTop: 12 }}>{t("camera.presets")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SPOT_LIGHT_POSITION_PRESETS.map((preset) => (
                <ActionButton
                  key={preset}
                  text={t(`camera.preset.${preset}`)}
                  onClick={() =>
                    patch(buildSpotLightPositionPresetPatch(liveLight, preset))
                  }
                />
              ))}
            </div>
          </>
        )}

        {liveLight.type === "HDRI" && (
          <>
            <p>{t("light.hdriPreset")}</p>
            <ScrollPanel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {HDRI_PRESETS.map((preset) => (
                  <HdriPreviewThumb
                    key={preset.id}
                    presetId={preset.id}
                    label={t(preset.labelKey)}
                    isActive={liveLight.hdriPreset === preset.id}
                    onClick={() => patch({ hdriPreset: preset.id })}
                  />
                ))}
              </div>
            </ScrollPanel>
            <ObjectNumberInput
              mode={mode}
              label={t("light.intensity")}
              sliderType="default"
              fields={[
                {
                  value: liveLight.intensity,
                  isActive: false,
                  onChange: (value) => patch({ intensity: value }),
                },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
