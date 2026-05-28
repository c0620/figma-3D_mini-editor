import { useCallback, useRef, type ChangeEvent } from "react";

import {
  useFigma,
  useHandlers,
  useI18n,
  useNotifications,
  useTransfer,
} from "@/app/ApplicationKernelContext";
import { downloadBlob, sanitizeExportBasename } from "@/lib/download";
import { isFigmaPlugin } from "@/figma/figmaApi";
import { textureGpuPool } from "@/store/textureGpuPool";
import type { Material, TextureSlot } from "@/types/scene";

async function urlToBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

export function useTextureSlotActions(material: Material | null) {
  const { t } = useI18n();
  const { textureImport, materialEditing } = useHandlers();
  const transfer = useTransfer();
  const notifications = useNotifications();
  const figma = useFigma();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<TextureSlot | null>(null);

  const saveToDevice = useCallback(
    async (slot: TextureSlot) => {
      if (!material) return;
      const stored = material.textures[slot];
      if (!stored?.url) return;

      const blob = await urlToBlob(stored.url);
      if (!blob) {
        notifications.pushError(t("texture.notify.saveFailed"), stored.url);
        return;
      }

      const safeMaterial = sanitizeExportBasename(
        material.name || material.id,
        material.id
      );
      downloadBlob(blob, `${safeMaterial}__${slot}.png`);
    },
    [material, notifications, t]
  );

  const openLoadFromDevice = useCallback((slot: TextureSlot) => {
    pendingSlotRef.current = slot;
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!material) return;
      const slot = pendingSlotRef.current;
      const file = event.target.files?.[0];
      event.target.value = "";
      pendingSlotRef.current = null;
      if (!slot || !file) return;

      const url = URL.createObjectURL(file);
      textureImport.execute({ materialId: material.id, slot, url });
    },
    [material, textureImport]
  );

  const saveToFigma = useCallback(
    (slot: TextureSlot) => {
      if (!material) return;
      void slot;
      if (!isFigmaPlugin()) {
        notifications.pushError(t("material.figmaVariable.unavailable"), "");
        return;
      }
      const stored = material.textures[slot];
      if (!stored?.url) return;
      transfer.textureFigma.exportTextureFrame(stored.url, material.name);
      notifications.pushSuccess(t("texture.notify.figmaExportPending"));
    },
    [material, notifications, t, transfer.textureFigma]
  );

  const loadFromFigma = useCallback(
    async (slot: TextureSlot) => {
      if (!material) return;
      if (!isFigmaPlugin()) {
        notifications.pushError(t("material.figmaVariable.unavailable"), "");
        return;
      }

      try {
        const frame = await figma.getLinkedSelection();
        if (!frame) {
          notifications.pushError(t("texture.notify.noLinkedFrame"), "");
          return;
        }
        transfer.textureFigma.importTextureFromFrame(
          frame.frameId,
          material.id,
          slot
        );
        notifications.pushSuccess(t("texture.notify.figmaImportPending"));
      } catch {
        notifications.pushError(t("texture.notify.figmaImportFailed"), "");
      }
    },
    [figma, material, notifications, t, transfer.textureFigma]
  );

  const deleteSlot = useCallback(
    (slot: TextureSlot) => {
      if (!material) return;
      const stored = material.textures[slot];
      if (stored?.url) textureGpuPool.evict(stored.url);

      materialEditing.execute({
        id: material.id,
        changes: { textures: { [slot]: null } },
      });
    },
    [material, materialEditing]
  );

  return {
    fileInputRef,
    onFileSelected,
    saveToDevice,
    openLoadFromDevice,
    saveToFigma,
    loadFromFigma,
    deleteSlot,
  };
}
