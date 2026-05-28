import { useI18n } from "@/app/ApplicationKernelContext";
import { LIBRARY_TAG_COUNT } from "@/library/assetCatalog";
import type { AssetTag } from "@/types/assets";
import { ASSET_TAGS } from "@/types/assets";
import type { TranslationKey } from "@/i18n/en";
import styles from "./AssetLibrary.module.css";

const FILTER_LABEL_KEYS: Record<AssetTag, TranslationKey> = {
  primitive: "library.filter.primitive",
  abstract: "library.filter.abstract",
  mockup: "library.filter.mockup",
};

export function AssetLibraryFilter({
  activeTag,
  assetCount,
  onTagChange,
}: {
  activeTag: AssetTag;
  assetCount: number;
  onTagChange: (tag: AssetTag) => void;
}) {
  const { t } = useI18n();
  const stats = t("library.stats")
    .replace("{count}", String(assetCount))
    .replace("{tags}", String(LIBRARY_TAG_COUNT));

  return (
    <div className={styles.filterBar}>
      <p className={styles.filterStats}>{stats}</p>
      <div className={styles.filterPills}>
        {ASSET_TAGS.map((tag) => {
          const isActive = tag === activeTag;
          return (
            <button
              key={tag}
              type="button"
              className={
                isActive
                  ? `${styles.filterPill} ${styles.filterPillActive}`
                  : styles.filterPill
              }
              onClick={() => onTagChange(tag)}
            >
              {t(FILTER_LABEL_KEYS[tag])}
            </button>
          );
        })}
      </div>
    </div>
  );
}
