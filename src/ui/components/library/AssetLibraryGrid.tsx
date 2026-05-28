import type { Asset, AssetTag } from "@/types/assets";
import { AssetCard } from "./AssetCard";
import { AssetLibraryEmpty } from "./AssetLibraryEmpty";
import { AssetLibraryFilter } from "./AssetLibraryFilter";
import styles from "./AssetLibrary.module.css";

export function AssetLibraryGrid({
  activeTag,
  assetCount,
  assets,
  loadingId,
  onTagChange,
  onAdd,
}: {
  activeTag: AssetTag;
  assetCount: number;
  assets: Asset[];
  loadingId: string | null;
  onTagChange: (tag: AssetTag) => void;
  onAdd: (assetId: string) => void;
}) {
  return (
    <>
      <AssetLibraryFilter
        activeTag={activeTag}
        assetCount={assetCount}
        onTagChange={onTagChange}
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
                onAdd={() => void onAdd(asset.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
