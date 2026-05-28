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
import { buildSpotLightingPresetPatch } from "@/lights/spotLightingPresets";
import { SPOT_LIGHTING_PRESET_ROWS } from "@/lights/spotLightingPresets";

import { useEffect, useMemo, useState } from "react";
import { MaterialPreviewThumb } from "../molecules/ScenePreviews";
import { LightTypeSelect } from "../molecules/LightTypeSelect";
import { HdriPresetSelect } from "../molecules/HdriPresetSelect";
import { TextureSlotRow } from "../molecules/TextureSlotRow";
import { TEXTURE_SLOT_ORDER } from "@/io/textureExportHelper";
import { TEXTURE_SLOT_LABEL_KEYS } from "@/lib/textureSlotLabels";
import { useTextureSlotActions } from "@/ui/hooks/useTextureSlotActions";
import { ObjectNumberInput, ObjectRatioInput } from "../molecules/EditorInput";
import { FigmaColorVariableSelect } from "../molecules/FigmaColorVariableSelect";
import { FovSelect } from "../molecules/FovSelect";
import { InputColor, Toggle } from "../atoms/Input";
import { useFigmaColorVariableSync } from "@/figma/useFigmaColorVariableSync";
import { OptionButton, PanelCtaButton } from "../atoms/Button";
import { CameraTypeSelect } from "../molecules/CameraTypeSelect";
import { ParamHelpPopover } from "../molecules/ParamHelpPopover";
import {
  CameraPresetIconButton,
  CameraPresetIconGrid,
} from "../molecules/CameraPresetIconButton";
import { PanelSectionHeading } from "../molecules/PanelSectionHeading";
import type { StandardCameraPresetId } from "@/types/scene";
import { PanelModeToggle } from "../atoms/Navigation";
import paramsStyles from "./PanelParams.module.css";
import compactStyles from "./PanelCompact.module.css";
import {
  isPanelOpen,
  PanelSceneModeContext,
  usePanelCompact,
  type PanelMode,
} from "./PanelScene";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { SpotLightingPresetId } from "@/lights/spotLightingPresets";
import materialsIcon from "@/assets/images/icons/descriptive/materials.svg";
import textureIcon from "@/assets/images/icons/descriptive/texture.svg";
import cameraPIcon from "@/assets/images/icons/descriptive/cameraP.svg";
import lensIcon from "@/assets/images/icons/descriptive/lens.svg";
import lightingIcon from "@/assets/images/icons/descriptive/lighting.svg";
import ambientLightIcon from "@/assets/images/icons/descriptive/ambientLight.svg";
import spotLightIcon from "@/assets/images/icons/descriptive/spotLight.svg";
import hdrIcon from "@/assets/images/icons/descriptive/hdr.svg";
import softLightIcon from "@/assets/images/icons/descriptive/softLight.svg";
import hardLightIcon from "@/assets/images/icons/descriptive/hardLight.svg";
import flatLightIcon from "@/assets/images/icons/descriptive/flatLight.svg";

const CAMERA_PRESET_ROWS: StandardCameraPresetId[][] = [
  ["top", "bottom", "left", "right"],
  ["front", "back"],
];

const SPOT_PRESET_ICONS: Record<SpotLightingPresetId, string> = {
  soft: softLightIcon,
  hard: hardLightIcon,
  flat: flatLightIcon,
};

function lightParamsIcon(type: LightType): string {
  switch (type) {
    case "Ambient":
      return ambientLightIcon;
    case "Spot":
      return spotLightIcon;
    case "HDRI":
      return hdrIcon;
  }
}

function ParamsPanelSectionHeader({
  titleKey,
  title,
  help,
  iconSrc,
}: {
  titleKey?: TranslationKey;
  title?: string;
  help?: { titleKey: TranslationKey; bodyKey: TranslationKey };
  iconSrc?: string;
}) {
  const { t } = useI18n();
  const compact = usePanelCompact();
  const heading = title ?? (titleKey != null ? t(titleKey) : "");
  if (compact) {
    if (!iconSrc) return null;
    return (
      <div className={paramsStyles.cameraSectionHeader}>
        <img
          className={compactStyles.sectionIconHeader}
          src={iconSrc}
          alt=""
          title={heading}
        />
      </div>
    );
  }
  return (
    <div className={paramsStyles.cameraSectionHeader}>
      {help ? (
        <ParamHelpPopover titleKey={help.titleKey} bodyKey={help.bodyKey} />
      ) : null}
      <h3 className="panel-editor-section-title">{heading}</h3>
    </div>
  );
}

const LIGHT_TYPE_LABEL_KEYS: Record<LightType, TranslationKey> = {
  Ambient: "light.type.ambient",
  Spot: "light.type.spot",
  HDRI: "light.type.hdri",
};

function formatLightParamsSectionTitle(
  template: string,
  type: LightType,
  t: (k: TranslationKey) => string
): string {
  return template.replace("{name}", t(LIGHT_TYPE_LABEL_KEYS[type]));
}

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
  const isOpen = isPanelOpen(mode);
  const containerClass = [
    "panel-container",
    "panel-container--editor",
    !isOpen ? "panel-container--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      <div className="panel-header">
        <PanelModeToggle mode={mode} setMode={setMode} />
        {isOpen ? (
          <div className="panel-header-title">
            <h2>{t("panel.params.title")}</h2>
          </div>
        ) : null}
      </div>
      <PanelSceneModeContext.Provider value={mode}>
        <div className={paramsStyles.panelParamsShell}>{children}</div>
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
  const [activeTextureName, setActiveTextureName] =
    useState<TextureSlot | null>(null);

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

  const open = isPanelOpen(mode);
  const textureSlotsToShow = useMemo(() => {
    if (open) return visibleTextureSlots;
    if (activeTextureName == null) return [];
    return visibleTextureSlots.filter((slot) => slot === activeTextureName);
  }, [open, visibleTextureSlots, activeTextureName]);

  return (
    <EditorParamsPanel mode={mode} setMode={setMode}>
      <div className={paramsStyles.panelBody}>
        <div className="panel-section">
          <PanelSectionHeading
            text={t("panel.params.meshMaterials")}
            iconSrc={materialsIcon}
          />
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
              <PanelSectionHeading
                text={formatMaterialSectionTitle(
                  t("panel.params.materialParams"),
                  activeMaterial.name
                )}
                iconSrc={materialsIcon}
              />
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
                      max: 10,
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
                layout={open ? "panel" : "picker"}
                color={activeMaterial.baseColor}
                onChange={(color) =>
                  materialEditing.execute({
                    id: activeMaterial.id,
                    changes: { baseColor: color, baseColorVariableId: null },
                  })
                }
              />
              {open ? (
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
              ) : null}
            </div>
            <div className="panel-section">
              <PanelSectionHeading
                text={formatMaterialSectionTitle(
                  t("panel.params.materialTextures"),
                  activeMaterial.name
                )}
                iconSrc={textureIcon}
              />
              <ScrollPanel variant="textures">
                <input
                  ref={textureActions.fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={textureActions.onFileSelected}
                />
                <div className={paramsStyles.textureList}>
                  {textureSlotsToShow.map((slot) => {
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
                          openLoadFromDevice: textureActions.openLoadFromDevice,
                          saveToFigma: textureActions.saveToFigma,
                          loadFromFigma: textureActions.loadFromFigma,
                          deleteSlot: (targetSlot) => {
                            textureActions.deleteSlot(targetSlot);
                            if (activeTextureName === targetSlot) {
                              const next = visibleTextureSlots.find(
                                (s) =>
                                  s !== targetSlot && activeMaterial.textures[s]
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
  const open = isPanelOpen(mode);

  const patch = (changes: CameraPatch) => {
    if (locked) return;
    cameraHandler.execute(changes);
  };

  return (
    <EditorParamsPanel mode={mode} setMode={setMode}>
      <div className={paramsStyles.panelCameraRoot}>
        <div className={paramsStyles.panelCameraBody}>
          <section className={paramsStyles.cameraSection}>
            <ParamsPanelSectionHeader
              titleKey="camera.type.title"
              iconSrc={cameraPIcon}
              help={{
                titleKey: "camera.help.type.title",
                bodyKey: "camera.help.type.body",
              }}
            />
            {open && locked ? (
              <p className="panel-editor-muted-note">
                {t("panel.scene.locked")}
              </p>
            ) : null}
            <CameraTypeSelect
              value={camera.type}
              disabled={locked}
              onChange={(type) => patch({ type })}
            />
          </section>

          <section className={paramsStyles.cameraSection}>
            <ParamsPanelSectionHeader
              titleKey="camera.params.title"
              iconSrc={lensIcon}
            />
            <ObjectNumberInput
              mode={mode}
              label={t("camera.near")}
              sliderType="default"
              sliderLayout="inline"
              inputWidth="compact"
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
              sliderLayout="inline"
              inputWidth="compact"
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
            {open ? (
              <div className={paramsStyles.aspectPreviewBlock}>
                <p className="panel-editor-field-label">
                  {t("camera.renderArea")}
                </p>
                <div className={paramsStyles.aspectPreviewRow}>
                  <Toggle
                    checked={camera.aspectPreviewEnabled}
                    disabled={locked}
                    onChange={(checked) =>
                      patch({ aspectPreviewEnabled: checked })
                    }
                  />
                  <span className="panel-editor-field-label">
                    {t("camera.aspectPreview.mode")}
                  </span>
                </div>
              </div>
            ) : null}
            {camera.type === "Perspective" ? (
              <div className={paramsStyles.fovBlock}>
                {open ? (
                  <p className="panel-editor-field-label">{t("camera.fov")}</p>
                ) : null}
                <FovSelect
                  value={camera.fov}
                  disabled={locked}
                  onChange={(value) => patch({ fov: value })}
                />
              </div>
            ) : null}
          </section>

          <section className={paramsStyles.cameraSection}>
            <ParamsPanelSectionHeader
              titleKey="camera.presets"
              help={{
                titleKey: "camera.help.presets.title",
                bodyKey: "camera.help.presets.body",
              }}
            />
            {open ? (
              <div className={paramsStyles.presetGrid}>
                {CAMERA_PRESET_ROWS.map((row) => (
                  <div
                    key={row.join("-")}
                    className={paramsStyles.presetGridRow}
                  >
                    {row.map((preset) => (
                      <OptionButton
                        key={preset}
                        text={t(`camera.preset.${preset}`)}
                        onClick={() =>
                          patch(buildStandardCameraPresetPatch(camera, preset))
                        }
                      />
                    ))}
                  </div>
                ))}
                {camera.savedView ? (
                  <div className={paramsStyles.presetGridRow}>
                    <OptionButton
                      text={t("camera.preset.saved")}
                      onClick={() => {
                        const savedPatch =
                          buildApplySavedCameraViewPatch(camera);
                        if (savedPatch) patch(savedPatch);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <CameraPresetIconGrid
                rows={CAMERA_PRESET_ROWS}
                savedView={Boolean(camera.savedView)}
                disabled={locked}
                onPreset={(preset) =>
                  patch(buildStandardCameraPresetPatch(camera, preset))
                }
                onSaved={() => {
                  const savedPatch = buildApplySavedCameraViewPatch(camera);
                  if (savedPatch) patch(savedPatch);
                }}
                onSaveCurrent={() => patch(buildSaveCameraViewPatch(camera))}
                labels={{
                  preset: (id) => t(`camera.preset.${id}`),
                  saved: t("camera.preset.saved"),
                  saveCurrent: t("camera.preset.saveCurrent"),
                }}
              />
            )}
          </section>
        </div>
        {open ? (
          <div className={paramsStyles.panelCameraFooter}>
            <PanelCtaButton
              text={t("camera.preset.saveCurrent")}
              disabled={locked}
              onClick={() => patch(buildSaveCameraViewPatch(camera))}
            />
          </div>
        ) : null}
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
  const open = isPanelOpen(mode);

  const patch = (changes: LightPatch) => {
    if (locked) return;
    lightEditing.execute({ id: liveLight.id, changes });
  };

  const intensityField = (value: number, onChange: (v: number) => void) => ({
    value,
    isActive: false,
    min: 0,
    max: 10000,
    step: 1,
    onChange,
  });

  return (
    <EditorParamsPanel mode={mode} setMode={setMode}>
      <div className={paramsStyles.panelLightRoot}>
        <div className={paramsStyles.panelLightBody}>
          <section className={paramsStyles.cameraSection}>
            <ParamsPanelSectionHeader
              titleKey="light.type.title"
              iconSrc={lightingIcon}
              help={{
                titleKey: "light.help.type.title",
                bodyKey: "light.help.type.body",
              }}
            />
            {open && locked ? (
              <p className="panel-editor-muted-note">
                {t("panel.scene.locked")}
              </p>
            ) : null}
            <LightTypeSelect
              value={liveLight.type}
              disabled={locked}
              onChange={(type) => patch({ type })}
            />
          </section>

          <section className={paramsStyles.cameraSection}>
            <ParamsPanelSectionHeader
              title={formatLightParamsSectionTitle(
                t("light.params.title"),
                liveLight.type,
                t
              )}
              iconSrc={lightParamsIcon(liveLight.type)}
            />
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
                      min: 1,
                      max: 100,
                      step: 0.01,
                      onChange: (value) => patch({ intensity: value }),
                    },
                  ]}
                />
                <InputColor
                  layout={open ? "panel" : "picker"}
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
                    intensityField(liveLight.intensity, (value) =>
                      patch({ intensity: value })
                    ),
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
                      max: 10000,
                      step: 1,
                      onChange: (value) => patch({ distance: value }),
                    },
                  ]}
                />
                <div className={paramsStyles.paramRow2}>
                  <ObjectNumberInput
                    mode={mode}
                    inputWidth="compact"
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
                    inputWidth="compact"
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
                </div>
                {open ? (
                  <div>
                    <p className="panel-editor-field-label">
                      {t("light.target")}
                    </p>
                    <button
                      type="button"
                      className={paramsStyles.lightTargetPlaceholder}
                      disabled
                    >
                      {t("light.target.placeholder")}
                    </button>
                  </div>
                ) : null}
                <InputColor
                  layout={open ? "panel" : "picker"}
                  color={liveLight.color}
                  onChange={(color) => patch({ color })}
                />
              </>
            )}

            {liveLight.type === "HDRI" && (
              <ObjectNumberInput
                mode={mode}
                label={t("light.intensity")}
                sliderType="default"
                fields={[
                  {
                    value: liveLight.intensity,
                    isActive: false,
                    min: 1,
                    max: 10,
                    step: 0.01,
                    onChange: (value) => patch({ intensity: value }),
                  },
                ]}
              />
            )}
          </section>
        </div>

        {liveLight.type === "HDRI" ? (
          <div className={paramsStyles.panelLightFooter}>
            <section className={paramsStyles.cameraSection}>
              <ParamsPanelSectionHeader
                titleKey="light.hdriPreset.title"
                iconSrc={hdrIcon}
                help={{
                  titleKey: "light.help.hdri.title",
                  bodyKey: "light.help.hdri.body",
                }}
              />
              <HdriPresetSelect
                value={liveLight.hdriPreset}
                disabled={locked}
                onChange={(preset) => patch({ hdriPreset: preset })}
              />
            </section>
          </div>
        ) : null}

        {liveLight.type === "Spot" ? (
          <div className={paramsStyles.panelLightFooter}>
            <section className={paramsStyles.cameraSection}>
              <ParamsPanelSectionHeader
                titleKey="light.presets.title"
                iconSrc={softLightIcon}
                help={{
                  titleKey: "light.help.presets.title",
                  bodyKey: "light.help.presets.body",
                }}
              />
              {open ? (
                <div className={paramsStyles.presetGrid}>
                  {SPOT_LIGHTING_PRESET_ROWS.map((row) => (
                    <div
                      key={row.join("-")}
                      className={paramsStyles.presetGridRow}
                    >
                      {row.map((preset) => (
                        <OptionButton
                          key={preset}
                          text={t(`light.preset.${preset}`)}
                          onClick={() =>
                            patch(buildSpotLightingPresetPatch(preset))
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={compactStyles.presetIconGrid}>
                  {SPOT_LIGHTING_PRESET_ROWS.flat().map((preset) => (
                    <CameraPresetIconButton
                      key={preset}
                      icon={SPOT_PRESET_ICONS[preset]}
                      title={t(`light.preset.${preset}`)}
                      disabled={locked}
                      onClick={() =>
                        patch(buildSpotLightingPresetPatch(preset))
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </EditorParamsPanel>
  );
}
