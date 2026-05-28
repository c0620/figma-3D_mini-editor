import { useMemo, useState } from "react";

import { useI18n, useTransfer } from "@/app/ApplicationKernelContext";
import type { AssetTag } from "@/types/assets";

export function useAssetLibraryGrid({
  onAddAsset,
}: {
  onAddAsset: (assetId: string, meshName: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const transfer = useTransfer();
  const [activeTag, setActiveTag] = useState<AssetTag>("primitive");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const assets = useMemo(
    () => transfer.assetCatalog.listAssets([activeTag]),
    [transfer.assetCatalog, activeTag]
  );

  const handleAdd = async (assetId: string) => {
    const asset = transfer.assetCatalog.getAsset(assetId);
    if (!asset) return;
    setLoadingId(assetId);
    try {
      await onAddAsset(assetId, t(asset.nameKey));
    } catch {
      // уведомление уже показано в фасаде
    } finally {
      setLoadingId(null);
    }
  };

  return {
    activeTag,
    setActiveTag,
    assets,
    loadingId,
    handleAdd,
  };
}
