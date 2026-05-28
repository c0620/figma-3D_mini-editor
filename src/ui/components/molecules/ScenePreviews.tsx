import { usePreview } from "@/app/ApplicationKernelContext";
import { materialPreviewCacheKey } from "@/services/previewService";
import type { HdriPresetId } from "@/types/scene";
import type { Material } from "@/types/scene";
import { useEffect, useMemo, useState } from "react";
import styles from "./ScenePreviews.module.css";

export function HdriPreviewThumb({
  presetId,
  label,
  isActive,
  onClick,
}: {
  presetId: HdriPresetId;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const preview = usePreview();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    preview
      .renderHdriPreset(presetId, { format: "dataUrl" })
      .then((url) => {
        if (!cancelled) setSrc(url as string);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [preview, presetId]);

  const thumbClass = isActive
    ? `${styles.hdriThumb} ${styles.hdriThumbActive}`
    : styles.hdriThumb;

  return (
    <div className={thumbClass} onClick={onClick}>
      {src ? (
        <img className={styles.hdriImg} src={src} alt="" />
      ) : (
        <div className={styles.previewPlaceholder} />
      )}
      <p
        className={
          isActive ? `${styles.thumbLabel} ${styles.thumbLabelActive}` : styles.thumbLabel
        }
      >
        {label}
      </p>
    </div>
  );
}

export function MaterialPreviewThumb({
  material,
  isActive,
  onClick,
}: {
  material: Material;
  isActive: boolean;
  onClick: () => void;
}) {
  const preview = usePreview();
  const [src, setSrc] = useState<string | null>(null);
  const materialKey = useMemo(
    () => materialPreviewCacheKey(material),
    [material]
  );

  useEffect(() => {
    let cancelled = false;

    preview
      .renderMaterial(material, { format: "dataUrl" })
      .then((url) => {
        if (!cancelled) setSrc(url as string);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [preview, material, materialKey]);

  const thumbClass = isActive
    ? `${styles.thumb} ${styles.thumbActive}`
    : styles.thumb;
  const labelClass = isActive
    ? `${styles.thumbLabel} ${styles.thumbLabelActive}`
    : styles.thumbLabel;

  return (
    <div className={thumbClass} onClick={onClick}>
      {src ? (
        <img className={styles.previewCircle} src={src} alt="" />
      ) : (
        <div className={styles.previewPlaceholder} />
      )}
      <p className={labelClass}>{material.name}</p>
    </div>
  );
}

