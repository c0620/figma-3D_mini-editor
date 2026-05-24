import {
  LinearSRGBColorSpace,
  NoColorSpace,
  SRGBColorSpace,
  type Material as ThreeMaterial,
  type MeshStandardMaterial,
  type Texture,
} from "three";

import type { Material, StoredTexture } from "../types/scene";
import { TextureSlot } from "../types/scene";

/** Доп. файлы для OBJ: .mtl и изображения из той же папки. */
export interface SceneImportResources {
  mtlText?: string;
  /** basename файла (lower-case) → содержимое */
  textureFiles?: Record<string, ArrayBuffer>;
}

const SLOT_COLOR_SPACE: Record<TextureSlot, StoredTexture["colorSpace"]> = {
  [TextureSlot.BaseColor]: "srgb",
  [TextureSlot.Emissive]: "srgb",
  [TextureSlot.Normal]: "linear",
  [TextureSlot.Roughness]: "linear",
  [TextureSlot.Metalness]: "linear",
};

type TextureImageSource =
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageBitmap
  | { data?: ArrayLike<number>; width: number; height: number };

/** В r184 `texture.image` — getter для `texture.source.data`. */
function getTextureImage(texture: Texture): TextureImageSource | null {
  return (texture.source?.data ?? texture.image) as TextureImageSource | null;
}

/**
 * Кеш URL для Three.Texture: одна GPU-текстура → один URL в сторе.
 * revoke только URL, созданные через createObjectURL в этом импорте.
 */
export class TextureUrlCache {
  private byTexture = new Map<Texture, string>();
  private ownedBlobUrls = new Set<string>();

  registerOwnedBlobUrl(url: string): void {
    if (url.startsWith("blob:")) this.ownedBlobUrls.add(url);
  }

  resolve(texture: Texture | null | undefined): string | null {
    if (!texture || !getTextureImage(texture)) return null;

    const hit = this.byTexture.get(texture);
    if (hit) return hit;

    const url = textureImageToUrlSync(texture);
    if (!url) return null;

    this.byTexture.set(texture, url);
    return url;
  }

  async resolveAsync(
    texture: Texture | null | undefined
  ): Promise<string | null> {
    if (!texture) return null;

    const hit = this.byTexture.get(texture);
    if (hit) return hit;

    const url =
      textureImageToUrlSync(texture) ??
      (await textureImageToUrlAsync(texture, this));

    if (!url) return null;

    this.byTexture.set(texture, url);
    return url;
  }

  dispose(): void {
    for (const url of this.ownedBlobUrls) URL.revokeObjectURL(url);
    this.ownedBlobUrls.clear();
    this.byTexture.clear();
  }
}

function textureColorSpaceLabel(
  texture: Texture,
  slot: TextureSlot
): StoredTexture["colorSpace"] {
  if (texture.colorSpace === SRGBColorSpace) return "srgb";
  if (
    texture.colorSpace === NoColorSpace ||
    texture.colorSpace === LinearSRGBColorSpace
  ) {
    return "linear";
  }
  return SLOT_COLOR_SPACE[slot];
}

async function extractStoredTextureAsync(
  texture: Texture | null | undefined,
  cache: TextureUrlCache,
  slot: TextureSlot
): Promise<StoredTexture | null> {
  if (!texture) return null;
  const url = await cache.resolveAsync(texture);
  if (!url) return null;

  return {
    url,
    flipY: texture.flipY,
    colorSpace: textureColorSpaceLabel(texture, slot),
  };
}

function extractStoredTexture(
  texture: Texture | null | undefined,
  cache: TextureUrlCache,
  slot: TextureSlot
): StoredTexture | null {
  if (!texture) return null;
  const url = cache.resolve(texture);
  if (!url) return null;

  return {
    url,
    flipY: texture.flipY,
    colorSpace: textureColorSpaceLabel(texture, slot),
  };
}

function textureImageToUrlSync(texture: Texture): string | null {
  const image = getTextureImage(texture);
  if (!image) return null;

  if (
    typeof HTMLImageElement !== "undefined" &&
    image instanceof HTMLImageElement &&
    image.src
  ) {
    return image.src;
  }

  if (typeof document === "undefined") return null;

  if (
    typeof HTMLCanvasElement !== "undefined" &&
    image instanceof HTMLCanvasElement
  ) {
    return null;
  }

  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    return null;
  }

  if (
    image &&
    typeof image === "object" &&
    "width" in image &&
    "height" in image &&
    "data" in image &&
    image.data
  ) {
    return null;
  }

  if (
    image &&
    typeof image === "object" &&
    "width" in image &&
    "height" in image
  ) {
    return null;
  }

  return null;
}

async function textureImageToUrlAsync(
  texture: Texture,
  cache: TextureUrlCache
): Promise<string | null> {
  const image = getTextureImage(texture);
  if (!image) return null;

  if (typeof document === "undefined") return null;

  if (
    typeof HTMLCanvasElement !== "undefined" &&
    image instanceof HTMLCanvasElement
  ) {
    return canvasToBlobUrl(image, cache);
  }

  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    return canvasFromImageSourceToBlobUrl(image, cache);
  }

  if (
    image &&
    typeof image === "object" &&
    "width" in image &&
    "height" in image &&
    "data" in image &&
    image.data
  ) {
    return dataTextureToBlobUrl(image.width, image.height, image.data, cache);
  }

  if (
    image &&
    typeof image === "object" &&
    "width" in image &&
    "height" in image
  ) {
    try {
      return canvasFromImageSourceToBlobUrl(image as CanvasImageSource, cache);
    } catch {
      return null;
    }
  }

  return null;
}

function canvasToBlobUrl(
  canvas: HTMLCanvasElement,
  cache: TextureUrlCache
): Promise<string | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const url = URL.createObjectURL(blob);
      cache.registerOwnedBlobUrl(url);
      resolve(url);
    }, "image/png");
  });
}

async function canvasFromImageSourceToBlobUrl(
  source: CanvasImageSource,
  cache: TextureUrlCache
): Promise<string | null> {
  const canvas = document.createElement("canvas");
  const width =
    "width" in source && typeof source.width === "number" ? source.width : 0;
  const height =
    "height" in source && typeof source.height === "number" ? source.height : 0;
  if (!width || !height) return null;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0);
  return canvasToBlobUrl(canvas, cache);
}

async function dataTextureToBlobUrl(
  width: number,
  height: number,
  data: ArrayLike<number>,
  cache: TextureUrlCache
): Promise<string | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rgba =
    data instanceof Uint8Array
      ? data
      : data instanceof Uint8ClampedArray
        ? data
        : new Uint8ClampedArray(data);

  const imageData = new ImageData(
    rgba instanceof Uint8ClampedArray ? rgba : new Uint8ClampedArray(rgba),
    width,
    height
  );
  ctx.putImageData(imageData, 0, 0);
  return canvasToBlobUrl(canvas, cache);
}

const emptyTextures = (): Material["textures"] => ({
  [TextureSlot.BaseColor]: null,
  [TextureSlot.Normal]: null,
  [TextureSlot.Roughness]: null,
  [TextureSlot.Metalness]: null,
  [TextureSlot.Emissive]: null,
});

async function fillTexturesFromThreeMaterial(
  mat: MeshStandardMaterial & {
    map?: Texture | null;
    normalMap?: Texture | null;
    roughnessMap?: Texture | null;
    metalnessMap?: Texture | null;
    emissiveMap?: Texture | null;
    aoMap?: Texture | null;
  },
  cache: TextureUrlCache
): Promise<Material["textures"]> {
  const textures = emptyTextures();

  textures[TextureSlot.BaseColor] = await extractStoredTextureAsync(
    mat.map,
    cache,
    TextureSlot.BaseColor
  );
  textures[TextureSlot.Normal] = await extractStoredTextureAsync(
    mat.normalMap,
    cache,
    TextureSlot.Normal
  );
  textures[TextureSlot.Roughness] = await extractStoredTextureAsync(
    mat.roughnessMap,
    cache,
    TextureSlot.Roughness
  );
  textures[TextureSlot.Metalness] = await extractStoredTextureAsync(
    mat.metalnessMap,
    cache,
    TextureSlot.Metalness
  );
  textures[TextureSlot.Emissive] = await extractStoredTextureAsync(
    mat.emissiveMap,
    cache,
    TextureSlot.Emissive
  );

  if (!textures[TextureSlot.Roughness] && mat.aoMap) {
    textures[TextureSlot.Roughness] = await extractStoredTextureAsync(
      mat.aoMap,
      cache,
      TextureSlot.Roughness
    );
  }

  return textures;
}

/** Карты Three.js → слоты доменной модели (GLB / FBX / OBJ+MTL). */
export async function extractTexturesFromThreeMaterialAsync(
  m: ThreeMaterial,
  cache: TextureUrlCache
): Promise<Material["textures"]> {
  return fillTexturesFromThreeMaterial(
    m as MeshStandardMaterial & {
      map?: Texture | null;
      normalMap?: Texture | null;
      roughnessMap?: Texture | null;
      metalnessMap?: Texture | null;
      emissiveMap?: Texture | null;
      aoMap?: Texture | null;
    },
    cache
  );
}

/** Синхронное извлечение URL (после LoadingManager.onLoad / parseAsync). */
export function extractTexturesFromThreeMaterial(
  m: ThreeMaterial,
  cache: TextureUrlCache
): Material["textures"] {
  const mat = m as MeshStandardMaterial & {
    map?: Texture | null;
    normalMap?: Texture | null;
    roughnessMap?: Texture | null;
    metalnessMap?: Texture | null;
    emissiveMap?: Texture | null;
    aoMap?: Texture | null;
  };

  const textures = emptyTextures();

  textures[TextureSlot.BaseColor] = extractStoredTexture(
    mat.map,
    cache,
    TextureSlot.BaseColor
  );
  textures[TextureSlot.Normal] = extractStoredTexture(
    mat.normalMap,
    cache,
    TextureSlot.Normal
  );
  textures[TextureSlot.Roughness] = extractStoredTexture(
    mat.roughnessMap,
    cache,
    TextureSlot.Roughness
  );
  textures[TextureSlot.Metalness] = extractStoredTexture(
    mat.metalnessMap,
    cache,
    TextureSlot.Metalness
  );
  textures[TextureSlot.Emissive] = extractStoredTexture(
    mat.emissiveMap,
    cache,
    TextureSlot.Emissive
  );

  if (!textures[TextureSlot.Roughness] && mat.aoMap) {
    textures[TextureSlot.Roughness] = extractStoredTexture(
      mat.aoMap,
      cache,
      TextureSlot.Roughness
    );
  }

  return textures;
}

export function hasAnyTextureUrl(textures: Material["textures"]): boolean {
  return Object.values(textures).some((entry) => entry?.url != null);
}

/** Применить flipY / colorSpace из стора к загруженной Three.Texture. */
export function applyStoredTextureSettings(
  texture: Texture | undefined,
  stored: StoredTexture | null | undefined
): void {
  if (!texture || !stored) return;
  texture.flipY = stored.flipY;
  texture.colorSpace =
    stored.colorSpace === "srgb" ? SRGBColorSpace : NoColorSpace;
  texture.needsUpdate = true;
}

export function defaultStoredTexture(
  url: string,
  slot: TextureSlot
): StoredTexture {
  return {
    url,
    flipY: true,
    colorSpace: SLOT_COLOR_SPACE[slot],
  };
}
