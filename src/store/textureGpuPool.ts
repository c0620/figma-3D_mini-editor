import { TextureLoader, type Texture } from "three";

import { applyStoredTextureSettings } from "../io/materialTextureExtractor";
import type { StoredTexture } from "../types/scene";

const textureLoader = new TextureLoader();

/**
 * Derived GPU-кеш: URL → THREE.Texture.
 * Не дублирует domain-state — только загрузка по данным из store.
 */
class TextureGpuPool {
  private inFlight = new Map<string, Promise<Texture>>();
  private cached = new Map<string, Texture>();

  load(stored: StoredTexture): Promise<Texture> {
    const { url } = stored;
    const hit = this.cached.get(url);
    if (hit) return Promise.resolve(hit);

    const pending = this.inFlight.get(url);
    if (pending) return pending;

    const promise = textureLoader
      .loadAsync(url)
      .then((texture) => {
        applyStoredTextureSettings(texture, stored);
        this.cached.set(url, texture);
        this.inFlight.delete(url);
        return texture;
      })
      .catch((error) => {
        this.inFlight.delete(url);
        throw error;
      });

    this.inFlight.set(url, promise);
    return promise;
  }

  get(url: string): Texture | undefined {
    return this.cached.get(url);
  }

  evict(url: string): void {
    const texture = this.cached.get(url);
    if (texture) {
      texture.dispose();
      this.cached.delete(url);
    }
    this.inFlight.delete(url);
  }

  clear(): void {
    for (const texture of this.cached.values()) {
      texture.dispose();
    }
    this.cached.clear();
    this.inFlight.clear();
  }
}

export const textureGpuPool = new TextureGpuPool();
