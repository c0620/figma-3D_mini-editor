import { usePreview } from "@/app/ApplicationKernelContext";
import { materialPreviewCacheKey } from "@/services/previewService";
import type { HdriPresetId } from "@/types/scene";
import type { Material } from "@/types/scene";
import { useEffect, useMemo, useState } from "react";
import { ActionButton, ActionButtonIcon } from "../atoms/Button";

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          width={30}
          height={30}
          alt=""
          style={{
            display: "block",
            objectFit: "cover",
            ...(isActive ? { outline: "1px solid orange" } : {}),
          }}
        />
      ) : (
        <div
          style={{
            width: 30,
            height: 30,
            background: "rgba(255, 255, 255, 0.15)",
          }}
        />
      )}
      <p
        style={
          isActive
            ? { color: "orange", margin: 0, fontSize: 12 }
            : { color: "white", margin: 0, fontSize: 12 }
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

  return (
    <div
      style={{
        display: "flex",
      }}
      onClick={onClick}
    >
      <p style={isActive ? { color: "orange" } : { color: "white" }}>
        {material.name}
      </p>
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

export function TexturePreviewThumb({
  isActive,
  name,
  materialID,
  url,
  onClick,
}: {
  isActive: boolean;
  name: string;
  materialID: string;
  url: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={isActive ? { border: "1px orange solid" } : {}}
    >
      <img src={url} style={{ width: "40px", height: "40px" }}></img>
      <p>{name}</p>
      {isActive && (
        <div style={{ display: "flex" }}>
          <ActionButtonIcon onClick={() => console.log("click")} src="none" />
          <ActionButtonIcon onClick={() => console.log("click")} src="none" />
          <ActionButtonIcon onClick={() => console.log("click")} src="none" />
          <ActionButtonIcon onClick={() => console.log("click")} src="none" />
          <ActionButtonIcon onClick={() => console.log("click")} src="none" />
        </div>
      )}
    </div>
  );
}
