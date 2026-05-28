import type { MouseEvent } from "react";

import { EditorIconButton } from "../atoms/Button";
import type { TextureSlot } from "@/types/scene";
import { usePanelCompact } from "../organisms/PanelScene";
import saveTextureLocalIcon from "@/assets/images/icons/descriptive/saveTextureLocal.svg";
import pickLocalIcon from "@/assets/images/icons/descriptive/pickLocal.svg";
import saveTextureFigmaIcon from "@/assets/images/icons/descriptive/saveTextureFigma.svg";
import pickTextureIcon from "@/assets/images/icons/descriptive/pickTexture.svg";
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
  const compact = usePanelCompact();
  const showAsActive = isActive || compact;

  const rowClass = [
    styles.row,
    compact ? styles.rowPanelCompact : showAsActive ? styles.rowActiveLayout : styles.rowCompact,
  ]
    .filter(Boolean)
    .join(" ");

  const previewClass = [
    styles.preview,
    compact ? styles.previewCompact : showAsActive ? styles.previewLarge : styles.previewCompact,
    showAsActive ? styles.previewActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const metaClass = [
    styles.meta,
    compact ? styles.metaPanelCompact : showAsActive ? "" : styles.metaCompact,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClass = [
    styles.label,
    showAsActive ? styles.labelActive : "",
  ].join(" ");

  const stop = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div className={rowClass} onClick={onSelect} role="button" tabIndex={0}>
      <img className={previewClass} src={url} alt="" />
      <div className={metaClass}>
        {!compact ? <p className={labelClass}>{label}</p> : null}
        {showAsActive ? (
          <div
            className={compact ? styles.actionsCompact : styles.actions}
            onClick={stop}
          >
            <EditorIconButton
              className={styles.actionBtn}
              src={saveTextureLocalIcon}
              title={actionLabels.saveDevice}
              onClick={() => void actions.saveToDevice(slot)}
            />
            <EditorIconButton
              className={styles.actionBtn}
              src={pickLocalIcon}
              title={actionLabels.loadDevice}
              onClick={() => actions.openLoadFromDevice(slot)}
            />
            <EditorIconButton
              className={styles.actionBtn}
              src={saveTextureFigmaIcon}
              title={actionLabels.saveFigma}
              onClick={() => actions.saveToFigma(slot)}
            />
            <EditorIconButton
              className={styles.actionBtn}
              src={pickTextureIcon}
              title={actionLabels.loadFigma}
              onClick={() => void actions.loadFromFigma(slot)}
            />
            <EditorIconButton
              className={styles.actionBtn}
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
