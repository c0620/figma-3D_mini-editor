import { SmallButton } from "../../atoms/buttons/Button";

import pickLocal from "@/assets/images/icons/descriptive/pickTextureLocal.svg?react";
import pickFigma from "@/assets/images/icons/descriptive/pickTextureFigma.svg?react";
import saveFigma from "@/assets/images/icons/descriptive/saveTextureFigma.svg?react";
import saveLocal from "@/assets/images/icons/descriptive/saveTextureLocal.svg?react";
import garbage from "@/assets/images/icons/descriptive/garbage.svg?react";

import styles from "./TextureItem.module.scss";

import { TexturePreview } from "../../atoms/scene/TexturePreview";
import type { Texture } from "three";
import type { MaterialID, TextureSlot } from "@/types/scene";
import { useHandlers } from "@/app/ApplicationKernelContext";
import clsx from "clsx";

export function TextureItem({
  materialId,
  slot,
  materialName,
  texture,
  isActive,
  onClick,
  openImportModal,
  isOpen,
}: {
  materialId: string;
  slot: TextureSlot;
  materialName: string;
  texture: Texture | null;
  isActive: boolean;
  onClick: () => void;
  openImportModal: () => void;
  isOpen: boolean;
}) {

  const { textureImport, textureExport } = useHandlers();

  return (
    <div
      className={clsx(styles.textureSelectContainer, {
        [styles.active]: isActive,
        [styles.textureSelectContainerClosed]: !isOpen,
      })}
      onClick={onClick}
      role="button"
    >
      <TexturePreview texture={texture} />
      <div className={styles.textureInfo}>
        {isOpen && <p className="t3">{materialName + " / " + slot}</p>}
        {isActive && (
          <div
            className={clsx(styles.textureButtonRow, {
              [styles.textureButtonRowClosed]: !isOpen,
            })}
          >
            <SmallButton img={pickLocal} onClick={openImportModal} />
            <SmallButton
              img={saveLocal}
              onClick={() =>
                textureExport({ materialId, slot, target: "local" })
              }
            />
            <SmallButton
              img={pickFigma}
              onClick={() =>
                textureImport.execute({
                  materialId,
                  slot,
                  source: "figma",
                  frameId: "",
                })
              }
            />
            <SmallButton
              img={saveFigma}
              onClick={() =>
                textureExport({ materialId, slot, target: "figma" })
              }
            />
            <SmallButton img={garbage} onClick={() => console.log("log")} />
          </div>
        )}
      </div>
    </div>
  );
}

export function TextureInput({
  materialId,
  slot,
}: {
  materialId: MaterialID;
  slot: TextureSlot;
}) {
  const { textureImport } = useHandlers();
  return (
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        textureImport.execute({
          materialId,
          slot,
          source: "local",
          file,
        });
        e.target.value = "";
      }}
    />
  );
}
