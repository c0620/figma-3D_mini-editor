import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useI18n, useTransfer } from "@/app/ApplicationKernelContext";
import type { AssetTag } from "@/types/assets";
import { NavTitle } from "../atoms/Navigation";
import { AssetCard } from "../library/AssetCard";
import { AssetLibraryEmpty } from "../library/AssetLibraryEmpty";
import { AssetLibraryFilter } from "../library/AssetLibraryFilter";
import styles from "../library/AssetLibrary.module.css";

export default function AssetLibraryScreen() {
  const { t } = useI18n();
  const transfer = useTransfer();
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState<AssetTag>("primitive");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const assets = useMemo(
    () => transfer.assetCatalog.listAssets([activeTag]),
    [transfer.assetCatalog, activeTag]
  );

  const handleAdd = async (assetId: string, projectName: string) => {
    setLoadingId(assetId);
    try {
      await transfer.loadLibraryAsset(assetId, projectName);
      navigate("/editor");
    } catch {
      // уведомление уже показано в фасаде
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="page page--library">
      <NavTitle title={t("library.title")} to="/" />
      <div className={styles.body}>
        <AssetLibraryFilter
          activeTag={activeTag}
          assetCount={assets.length}
          onTagChange={setActiveTag}
        />
        <div className={styles.scroll}>
          {assets.length === 0 ? (
            <AssetLibraryEmpty />
          ) : (
            <div className={styles.grid}>
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  loading={loadingId === asset.id}
                  onAdd={() => void handleAdd(asset.id, t(asset.nameKey))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
