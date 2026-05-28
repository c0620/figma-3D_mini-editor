import { WebGLRenderer } from "three";

/** Minimal WebGL context for scene build / GLB export when no canvas render runs. */
export function createOffscreenRenderer(): WebGLRenderer {
  const renderer = new WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(16, 16);
  return renderer;
}
