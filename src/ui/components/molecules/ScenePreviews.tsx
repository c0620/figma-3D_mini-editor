import { usePreview } from "@/app/ApplicationKernelContext";
import { materialPreviewCacheKey } from "@/services/previewService";
import type { Material } from "@/types/scene";
import { useEffect, useMemo, useState } from "react";

export function MaterialPreviewThumb({ material }: { material: Material }) {
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

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      {material.name}
      {src ? (
        <img
          src={src}
          width={30}
          height={30}
          alt=""
          style={{ display: "block", objectFit: "cover" }}
        />
      ) : null}
    </div>
  );
}
