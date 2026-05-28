import { useNavigate } from "react-router";

import { useI18n, useTransfer } from "@/app/ApplicationKernelContext";
import { useAssetLibraryGrid } from "@/ui/hooks/useAssetLibraryGrid";
import { NavTitle } from "../atoms/Navigation";
import { AssetLibraryGrid } from "../library/AssetLibraryGrid";
import styles from "../library/AssetLibrary.module.css";

export default function AssetLibraryScreen() {
  const { t } = useI18n();
  const transfer = useTransfer();
  const navigate = useNavigate();

  const { activeTag, setActiveTag, assets, loadingId, handleAdd } =
    useAssetLibraryGrid({
      onAddAsset: async (assetId, projectName) => {
        await transfer.loadLibraryAsset(assetId, projectName);
        navigate("/editor");
      },
    });

  return (
    <div className="page page--library">
      <NavTitle title={t("library.title")} to="/" />
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
  );
}
