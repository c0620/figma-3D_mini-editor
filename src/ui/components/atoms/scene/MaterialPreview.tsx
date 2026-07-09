import { useRender } from "@/app/ApplicationKernelContext";
import { useSceneStore } from "@/store/sceneStore";
import type { MaterialID } from "@/types/scene";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import styles from "./MaterialPreview.module.scss";

export function MaterialPreview({
  materialID,
  name,
  onClick,
  isActive,
}: {
  materialID: MaterialID;
  onClick: () => void;
  name: string;
  isActive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderService = useRender();
  const material = useSceneStore((s) => s.scene?.materials[materialID]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !material) return;
    renderService.renderMaterialPreview(canvas, materialID);
  }, [materialID, material, renderService]);

  return (
    <div
      className={clsx(styles.materialPreview, "t3", {
        [styles.active]: isActive,
        accent: isActive,
      })}
      onClick={onClick}
    >
      <canvas ref={canvasRef}></canvas>
      <p className="t3">{name}</p>
    </div>
  );
}
