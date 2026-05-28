import { useCallback, useEffect } from "react";

import { useHandlers, useI18n, useTransfer } from "@/app/ApplicationKernelContext";
import { useAssetLibraryGrid } from "@/ui/hooks/useAssetLibraryGrid";
import { NavModalHeader } from "../atoms/Navigation";
import { AssetLibraryGrid } from "../library/AssetLibraryGrid";
import styles from "./AssetLibraryModal.module.css";

const TITLE_ID = "asset-library-modal-title";

export function AssetLibraryModal({ onClose }: { onClose?: () => void }) {
  const { t } = useI18n();
  const transfer = useTransfer();
  const { selection } = useHandlers();

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  const { activeTag, setActiveTag, assets, loadingId, handleAdd } =
    useAssetLibraryGrid({
      onAddAsset: async (assetId, meshName) => {
        const meshId = await transfer.appendLibraryAsset(assetId, meshName);
        handleClose();
        if (meshId) {
          selection.execute({ id: meshId });
        }
      },
    });

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(e) => e.stopPropagation()}
      >
        <NavModalHeader
          title={t("library.title")}
          titleId={TITLE_ID}
          onClose={handleClose}
        />
        <div className={styles.body}>
          <AssetLibraryGrid
            activeTag={activeTag}
            assetCount={assets.length}
            assets={assets}
            loadingId={loadingId}
            onTagChange={setActiveTag}
            onAdd={handleAdd}
          />
        </div>
      </div>
    </div>
  );
}
