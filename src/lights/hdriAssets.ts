import type { HdriPresetId } from "../types/scene";

import studioHdrB64 from "@/assets/hdri/studio_small_03_1k.hdr?base64";
import sunsetHdrB64 from "@/assets/hdri/venice_sunset_1k.hdr?base64";
import warehouseHdrB64 from "@/assets/hdri/empty_warehouse_01_1k.hdr?base64";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function toBlobUrl(base64: string): string {
  return URL.createObjectURL(
    new Blob([base64ToArrayBuffer(base64)], {
      type: "application/octet-stream",
    })
  );
}

let blobUrlCache: Record<HdriPresetId, string> | null = null;

function ensureBlobUrls(): Record<HdriPresetId, string> {
  if (!blobUrlCache) {
    try {
      blobUrlCache = {
        studio: toBlobUrl(studioHdrB64),
        sunset: toBlobUrl(sunsetHdrB64),
        warehouse: toBlobUrl(warehouseHdrB64),
      };
    } catch (error) {
      console.error("HDRI: failed to decode embedded assets", error);
      throw error;
    }
  }
  return blobUrlCache;
}

export function getHdriBlobUrl(presetId: HdriPresetId): string {
  const urls = ensureBlobUrls();
  return urls[presetId] ?? urls.studio;
}

/** Прогрев blob URL при старте UI — ошибки видны сразу в консоли. */
export function preloadHdriBlobUrls(): void {
  for (const preset of ["studio", "sunset", "warehouse"] as const) {
    getHdriBlobUrl(preset);
  }
}

export function disposeHdriBlobUrls(): void {
  if (!blobUrlCache) return;
  for (const url of Object.values(blobUrlCache)) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache = null;
}
