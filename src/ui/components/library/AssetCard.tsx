import { useI18n } from "@/app/ApplicationKernelContext";
import type { Asset, AssetTag } from "@/types/assets";
import type { TranslationKey } from "@/i18n/en";
import { ActionButton } from "../atoms/Button";
import buttonStyles from "../atoms/Button.module.css";
import { AssetPreviewCanvas } from "./AssetPreviewCanvas";
import styles from "./AssetLibrary.module.css";

const TAG_LABEL_KEYS: Record<AssetTag, TranslationKey> = {
  primitive: "library.tag.primitive",
  abstract: "library.tag.abstract",
  mockup: "library.tag.mockup",
};

export function AssetCard({
  asset,
  onAdd,
  loading,
}: {
  asset: Asset;
  onAdd: () => void;
  loading: boolean;
}) {
  const { t } = useI18n();
  const primaryTag = asset.tags[0] ?? "primitive";
  const polygons = t("library.polygons").replace(
    "{count}",
    String(asset.polygonCount)
  );

  return (
    <article className={styles.card}>
      <span className={styles.cardTag}>{t(TAG_LABEL_KEYS[primaryTag])}</span>
      <AssetPreviewCanvas kind={asset.primitiveKind} />
      <h3 className={styles.cardTitle}>{t(asset.nameKey)}</h3>
      <p className={styles.cardMeta}>{t("library.proceduralSize")}</p>
      <p className={styles.cardMeta}>{polygons}</p>
      <ActionButton
        text={t("library.addToScene")}
        onClick={onAdd}
        disabled={loading}
        className={buttonStyles.actionButtonModal}
      />
    </article>
  );
}
