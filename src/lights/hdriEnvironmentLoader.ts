import {
  EquirectangularReflectionMapping,
  PMREMGenerator,
  WebGLRenderer,
  type Texture,
} from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import type { HdriPresetId } from "../types/scene";
import { getHdriPresetUrl } from "./hdriPresets";

/** PMREM env map for the given WebGLRenderer context (export / preview). */
export async function loadHdriEnvironmentMap(
  renderer: WebGLRenderer,
  presetId: HdriPresetId
): Promise<Texture> {
  const pmrem = new PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  try {
    const rgbeLoader = new RGBELoader();
    const url = getHdriPresetUrl(presetId);
    const hdrTexture = await rgbeLoader.loadAsync(url);
    hdrTexture.mapping = EquirectangularReflectionMapping;
    const envMap = pmrem.fromEquirectangular(hdrTexture).texture;
    hdrTexture.dispose();
    return envMap;
  } finally {
    pmrem.dispose();
  }
}
