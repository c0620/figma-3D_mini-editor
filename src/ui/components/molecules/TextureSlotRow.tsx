import type { MouseEvent } from "react";

import { EditorIconButton } from "../atoms/Button";
import type { TextureSlot } from "@/types/scene";
import saveTextureLocalIcon from "@/assets/images/icons/descriptive/saveTextureLocal.svg";
import loadTextureDeviceIcon from "@/assets/images/icons/descriptive/file.svg";
import saveTextureFigmaIcon from "@/assets/images/icons/descriptive/saveTextureFigma.svg";
import loadTextureFigmaIcon from "@/assets/images/icons/descriptive/frame.svg";
import deleteTextureIcon from "@/assets/images/icons/descriptive/garbage.svg";
import styles from "./TextureSlotRow.module.css";

export type TextureSlotRowActions = {
  saveToDevice: (slot: TextureSlot) => void;
  openLoadFromDevice: (slot: TextureSlot) => void;
  saveToFigma: (slot: TextureSlot) => void;
  loadFromFigma: (slot: TextureSlot) => void;
  deleteSlot: (slot: TextureSlot) => void;
};

export type TextureSlotActionLabels = {
  saveDevice: string;
  loadDevice: string;
  saveFigma: string;
  loadFigma: string;
  delete: string;
};

export function TextureSlotRow({
  slot,
  url,
  label,
  isActive,
  actionLabels,
  actions,
  onSelect,
}: {
  slot: TextureSlot;
  url: string;
  label: string;
  isActive: boolean;
  actionLabels: TextureSlotActionLabels;
  actions: TextureSlotRowActions;
  onSelect: () => void;
}) {
  const rowClass = [
    styles.row,
    isActive ? styles.rowActive : "",
    isActive ? styles.rowActiveLayout : styles.rowCompact,
  ]
    .filter(Boolean)
    .join(" ");

  const previewClass = [
    styles.preview,
    isActive ? styles.previewLarge : styles.previewCompact,
  ].join(" ");

  const metaClass = [styles.meta, isActive ? "" : styles.metaCompact]
    .filter(Boolean)
    .join(" ");

  const labelClass = [
    styles.label,
    isActive ? styles.labelActive : "",
  ].join(" ");

  const stop = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div className={rowClass} onClick={onSelect} role="button" tabIndex={0}>
      <img className={previewClass} src={url} alt="" />
      <div className={metaClass}>
        <p className={labelClass}>{label}</p>
        {isActive ? (
          <div className={styles.actions} onClick={stop}>
            <EditorIconButton
              src={saveTextureLocalIcon}
              title={actionLabels.saveDevice}
              onClick={() => void actions.saveToDevice(slot)}
            />
            <EditorIconButton
              src={loadTextureDeviceIcon}
              title={actionLabels.loadDevice}
              onClick={() => actions.openLoadFromDevice(slot)}
            />
            <EditorIconButton
              src={saveTextureFigmaIcon}
              title={actionLabels.saveFigma}
              onClick={() => actions.saveToFigma(slot)}
            />
            <EditorIconButton
              src={loadTextureFigmaIcon}
              title={actionLabels.loadFigma}
              onClick={() => void actions.loadFromFigma(slot)}
            />
            <EditorIconButton
              src={deleteTextureIcon}
              title={actionLabels.delete}
              onClick={() => actions.deleteSlot(slot)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
