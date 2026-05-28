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
import { HdriPreviewThumb, MaterialPreviewThumb } from "../molecules/ScenePreviews";
import { TextureSlotRow } from "../molecules/TextureSlotRow";
import { TEXTURE_SLOT_ORDER } from "@/io/textureExportHelper";
import { TEXTURE_SLOT_LABEL_KEYS } from "@/lib/textureSlotLabels";
import { useTextureSlotActions } from "@/ui/hooks/useTextureSlotActions";
import { ObjectNumberInput, ObjectRatioInput } from "../molecules/EditorInput";
import { FigmaColorVariableSelect } from "../molecules/FigmaColorVariableSelect";
import { FovSelect } from "../molecules/FovSelect";
import { InputColor } from "../atoms/Input";
import { useFigmaColorVariableSync } from "@/figma/useFigmaColorVariableSync";
import { ActionButton } from "../atoms/Button";
import { PanelModeToggle } from "../atoms/Navigation";
import paramsStyles from "./PanelParams.module.css";
import { PanelSceneModeContext, type PanelMode } from "./PanelScene";
import type { Dispatch, ReactNode, SetStateAction } from "react";

function EditorParamsPanel({
  mode,
  setMode,
  children,
}: {
  mode: PanelMode;
  setMode: Dispatch<SetStateAction<PanelMode>>;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const isOpen = mode === "openR" || mode === "openL";
  return (
    <div className="panel-container panel-container--editor">
      <div className="panel-header">
        <PanelModeToggle mode={mode} setMode={setMode} />
        {isOpen ? (
          <div className="panel-header-title">
            <h2>{t("panel.params.title")}</h2>
          </div>
        ) : null}
      </div>
      <PanelSceneModeContext.Provider value={mode}>
        {isOpen ? children : null}
      </PanelSceneModeContext.Provider>
    </div>
  );
}

function formatMaterialSectionTitle(template: string, name: string): string {
  return template.replace("{name}", name);
}

export function PanelMesh({ mesh }: { mesh: SceneMesh }) {
  void mesh;
  const { t } = useI18n();
  const materials = useActiveMeshMaterials();
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [mode, setMode] = useState<PanelMode>("openR");
  const { materialEditing } = useHandlers();
  useFigmaColorVariableSync();

  const activeMaterial = materials ? materials[activeMaterialIndex] : null;
  const textureActions = useTextureSlotActions(activeMaterial);
  const [activeTextureName, setActiveTextureName] = useState<TextureSlot | null>(
    null
  );

  const visibleTextureSlots = useMemo(() => {
    if (!activeMaterial) return [];
    return TEXTURE_SLOT_ORDER.filter((slot) => activeMaterial.textures[slot]);
  }, [activeMaterial]);

  useEffect(() => {
    if (!activeMaterial || visibleTextureSlots.length === 0) {
      setActiveTextureName(null);
      return;
    }
    if (
      activeTextureName == null ||
      !activeMaterial.textures[activeTextureName]
    ) {
      setActiveTextureName(visibleTextureSlots[0]);
    }
  }, [activeMaterial, activeTextureName, visibleTextureSlots]);

  const textureActionLabels = useMemo(
    () => ({
      saveDevice: t("texture.action.saveDevice"),
      loadDevice: t("texture.action.loadDevice"),
      saveFigma: t("texture.action.saveFigma"),
      loadFigma: t("texture.action.loadFigma"),
      delete: t("texture.action.delete"),
    }),
    [t]
  );

  return (
    <EditorParamsPanel mode={mode} setMode={setMode}>
      <div className={paramsStyles.panelBody}>
        <div className="panel-section">
          <p className={paramsStyles.sectionTitle}>
            {t("panel.params.meshMaterials")}
          </p>
          <ScrollPanel variant="mats">
            <div className={paramsStyles.materialList}>
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
        </div>
        {activeMaterial && (
          <div className={paramsStyles.paramStack}>
            <div className="panel-section">
              <p className={paramsStyles.sectionTitle}>
                {formatMaterialSectionTitle(
                  t("panel.params.materialParams"),
                  activeMaterial.name
                )}
              </p>
              <div className={paramsStyles.paramRow2}>
                <ObjectNumberInput
                  mode={mode}
                  inputWidth="compact"
                  fields={[
                    {
                      onChange: (field) =>
                        materialEditing.execute({
                          id: activeMaterial.id,
                          changes: { roughness: field },
                        }),
                      isActive: false,
                      value: activeMaterial.roughness,
                      min: 0,
                      max: 1,
                      step: 0.01,
                    },
                  ]}
                  label={t("material.roughness")}
                  sliderType="default"
                />
                <ObjectNumberInput
                  mode={mode}
                  inputWidth="compact"
                  fields={[
                    {
                      onChange: (field) =>
                        materialEditing.execute({
                          id: activeMaterial.id,
                          changes: { metalness: field },
                        }),
                      isActive: false,
                      value: activeMaterial.metalness,
                      min: 0,
                      max: 1,
                      step: 0.01,
                    },
                  ]}
                  label={t("material.metalness")}
                  sliderType="default"
                />
              </div>
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
                    min: 0,
                    max: 10000,
                    step: 1,
                  },
                ]}
                label={t("material.emissiveIntensity")}
                sliderType="default"
              />
              <InputColor
                layout="panel"
                color={activeMaterial.baseColor}
                onChange={(color) =>
                  materialEditing.execute({
                    id: activeMaterial.id,
                    changes: { baseColor: color, baseColorVariableId: null },
                  })
                }
              />
              <FigmaColorVariableSelect
                value={activeMaterial.baseColorVariableId}
                onSelect={(variableId, hex) =>
                  materialEditing.execute({
                    id: activeMaterial.id,
                    changes: {
                      baseColorVariableId: variableId,
                      baseColor: hex,
                    },
                  })
                }
                onClear={() =>
                  materialEditing.execute({
                    id: activeMaterial.id,
                    changes: { baseColorVariableId: null },
                  })
                }
              />
            </div>
            <div className="panel-section">
              <p className={paramsStyles.sectionTitle}>
                {formatMaterialSectionTitle(
                  t("panel.params.materialTextures"),
                  activeMaterial.name
                )}
              </p>
              <ScrollPanel variant="textures">
                <input
                  ref={textureActions.fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={textureActions.onFileSelected}
                />
                <div className={paramsStyles.textureList}>
                  {visibleTextureSlots.map((slot) => {
                    const stored = activeMaterial.textures[slot];
                    if (!stored) return null;
                    return (
                      <TextureSlotRow
                        key={slot}
                        slot={slot}
                        url={stored.url}
                        label={t(TEXTURE_SLOT_LABEL_KEYS[slot])}
                        isActive={activeTextureName === slot}
                        actionLabels={textureActionLabels}
                        actions={{
                          saveToDevice: textureActions.saveToDevice,
                          openLoadFromDevice:
                            textureActions.openLoadFromDevice,
                          saveToFigma: textureActions.saveToFigma,
                          loadFromFigma: textureActions.loadFromFigma,
                          deleteSlot: (targetSlot) => {
                            textureActions.deleteSlot(targetSlot);
                            if (activeTextureName === targetSlot) {
                              const next = visibleTextureSlots.find(
                                (s) =>
                                  s !== targetSlot &&
                                  activeMaterial.textures[s]
                              );
                              setActiveTextureName(next ?? null);
                            }
                          },
                        }}
                        onSelect={() => setActiveTextureName(slot)}
                      />
                    );
                  })}
                </div>
              </ScrollPanel>
            </div>
          </div>
        )}
      </div>
    </EditorParamsPanel>
  );
}

export function PanelCamera(_props: { camera: CameraState }) {
  void _props;
  const camera = useSceneStore((s) => s.scene?.camera);
  const [mode, setMode] = useState<PanelMode>("openR");
  const { camera: cameraHandler } = useHandlers();
  const { t } = useI18n();

  if (!camera) return null;

  const locked = camera.locked;

  const patch = (changes: CameraPatch) => {
    if (locked) return;
    cameraHandler.execute(changes);
  };

  return (
    <EditorParamsPanel mode={mode} setMode={setMode}>
      <div className="panel-section">
        <p className={paramsStyles.sectionTitle}>{t("panel.scene.editing")}</p>
        {locked ? (
          <div style={{ opacity: 0.85, marginBottom: 8 }}>
            {t("panel.scene.locked")}
          </div>
        ) : null}
        <div className={paramsStyles.presetRow}>
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
          sliderType="default"
          fields={[
            {
              value: camera.near,
              isActive: false,
              min: 0.01,
              max: Math.max(0.02, Math.min(camera.far - 0.01, 1000)),
              step: 0.01,
              onChange: (value) => patch({ near: value }),
            },
          ]}
        />
        <ObjectNumberInput
          mode={mode}
          label={t("camera.far")}
          sliderType="default"
          fields={[
            {
              value: camera.far,
              isActive: false,
              min: camera.near + 0.01,
              max: 10000,
              step: 1,
              onChange: (value) => patch({ far: value }),
            },
          ]}
        />
        <ObjectRatioInput
          mode={mode}
          label={t("camera.aspect")}
          value={camera.aspect}
          onChange={(value) => patch({ aspect: value })}
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
          <div className={paramsStyles.fovBlock}>
            <p className={paramsStyles.fovLabel}>{t("camera.fov")}</p>
            <FovSelect
              value={camera.fov}
              disabled={locked}
              onChange={(value) => patch({ fov: value })}
            />
          </div>
        )}
        <p className={paramsStyles.sectionTitle}>{t("camera.presets")}</p>
        <div className={paramsStyles.presetRow}>
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
    </EditorParamsPanel>
  );
}

export function PanelLight({ light }: { light: Light }) {
  const liveLight =
    useSceneStore((s) => s.scene?.lights.find((l) => l.id === light.id)) ??
    light;
  const [mode, setMode] = useState<PanelMode>("openR");
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
    <EditorParamsPanel mode={mode} setMode={setMode}>
      <div className="panel-section">
        <p className={paramsStyles.sectionTitle}>{t("panel.scene.editing")}</p>
        {locked ? (
          <div style={{ opacity: 0.85, marginBottom: 8 }}>
            {t("panel.scene.locked")}
          </div>
        ) : null}
        <div className={paramsStyles.presetRow}>
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
                  min: 0,
                  max: 10,
                  step: 0.01,
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
                  min: 0,
                  max: 10,
                  step: 0.01,
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
                  min: 0,
                  max: 100,
                  step: 0.1,
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
                  min: 0,
                  max: 1,
                  step: 0.01,
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
                  min: 0,
                  max: Math.PI / 2,
                  step: 0.01,
                  onChange: (value) => patch({ angle: value }),
                },
              ]}
            />
            <InputColor
              color={liveLight.color}
              onChange={(color) => patch({ color })}
            />
            <p className={paramsStyles.sectionTitle}>{t("camera.presets")}</p>
            <div className={paramsStyles.presetRow}>
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
            <p className={paramsStyles.sectionTitle}>{t("light.hdriPreset")}</p>
            <div className={paramsStyles.hdriRow}>
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
            <ObjectNumberInput
              mode={mode}
              label={t("light.intensity")}
              sliderType="default"
              fields={[
                {
                  value: liveLight.intensity,
                  isActive: false,
                  min: 0,
                  max: 10,
                  step: 0.01,
                  onChange: (value) => patch({ intensity: value }),
                },
              ]}
            />
          </>
        )}
      </div>
    </EditorParamsPanel>
  );
}
