import { TextureSlot } from "@/types/scene";
import {
  NoColorSpace,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";

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

function isDataTextureImage(image: Texture["image"]): image is DataTextureImage {
  if (typeof image !== "object" || image === null) return false;
  const candidate = image as Partial<DataTextureImage>;
  return (
    candidate.data != null &&
    typeof candidate.width === "number" &&
    typeof candidate.height === "number"
  );
}

function drawTextureToCanvas(
  canvas: HTMLCanvasElement,
  texture: Texture
): boolean {
  const image = texture.image;
  const ctx = canvas.getContext("2d");
  if (!ctx || image == null) return false;

  if (isDrawableImageSource(image)) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    return true;
  }

  if (isDataTextureImage(image)) {
    const { data, width, height } = image;
    canvas.width = width;
    canvas.height = height;
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(data);
    ctx.putImageData(imgData, 0, 0);
    return true;
  }

  return false;
}

export class TextureLocalService {
  async loadTextureFromFile(file: File, slot: TextureSlot): Promise<Texture> {
    const url = URL.createObjectURL(file);
    try {
      const texture = await new TextureLoader().loadAsync(url);
      texture.colorSpace =
        slot === TextureSlot.BaseColor || slot === TextureSlot.Emissive
          ? SRGBColorSpace
          : NoColorSpace;
      texture.needsUpdate = true;
      return texture;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  exportTextureToFile(texture: Texture, filename: string): void {
    const canvas = document.createElement("canvas");
    if (!drawTextureToCanvas(canvas, texture)) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }
}
