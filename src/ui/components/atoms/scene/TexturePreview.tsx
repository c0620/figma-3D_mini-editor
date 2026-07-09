import { useEffect, useRef } from "react";
import type { Texture } from "three";

import textureIcon from "@/assets/images/icons/descriptive/texture.svg";
import styles from "./TexturePreview.module.scss";

type DataTextureImage = {
  data: ArrayLike<number>;
  width: number;
  height: number;
};

function isDrawableImageSource(
  image: Texture["image"]
): image is HTMLImageElement | HTMLCanvasElement | ImageBitmap {
  return (
    image instanceof HTMLImageElement ||
    image instanceof HTMLCanvasElement ||
    image instanceof ImageBitmap
  );
}

function isDataTextureImage(
  image: Texture["image"]
): image is DataTextureImage {
  if (typeof image !== "object" || image === null) return false;
  const candidate = image as Partial<DataTextureImage>;
  return (
    candidate.data != null &&
    typeof candidate.width === "number" &&
    typeof candidate.height === "number"
  );
}

function drawToCanvas(
  canvas: HTMLCanvasElement,
  image: Texture["image"]
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || image == null) return;

  if (isDrawableImageSource(image)) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    return;
  }

  if (isDataTextureImage(image)) {
    const { data, width, height } = image;
    canvas.width = width;
    canvas.height = height;
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(data);
    ctx.putImageData(imgData, 0, 0);
  }
}

export function TexturePreview({
  texture,
}: {
  texture: Texture | null | undefined;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!texture?.image) {
      const ctx = canvas?.getContext("2d");
      const image = new Image();
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      image.onload = () => {
        ctx!.clearRect(0, 0, size, size);
        ctx!.drawImage(image, 0, 0, size, size);
      };
      image.src = textureIcon;
      return;
    }

    const image = texture.image;
    if (isDrawableImageSource(image) && !image.width) {
      if (image instanceof HTMLImageElement && !image.complete) {
        const onLoad = () => drawToCanvas(canvas, image);
        image.addEventListener("load", onLoad);
        return () => image.removeEventListener("load", onLoad);
      }
      return;
    }

    drawToCanvas(canvas, image);
  }, [texture]);

  return <canvas ref={canvasRef} className={styles.textureCanvas} />;
}
