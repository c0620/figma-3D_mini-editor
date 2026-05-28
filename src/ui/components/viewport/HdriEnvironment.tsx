import { useThree } from "@react-three/fiber";
import {
  EquirectangularReflectionMapping,
  PMREMGenerator,
  type Texture,
} from "three";
import { RGBELoader } from "three-stdlib";
import { Suspense, useEffect, useLayoutEffect } from "react";

import { getHdriPresetUrl } from "@/lights/hdriPresets";
import type { HdriPresetId } from "@/types/scene";

function HdriEnvironmentInner({
  preset,
  intensity,
}: {
  preset: HdriPresetId;
  intensity: number;
}) {
  const url = getHdriPresetUrl(preset);
  const { gl, scene } = useThree();

  useEffect(() => {
    let disposed = false;
    let envMap: Texture | null = null;
    const loader = new RGBELoader();

    void loader.loadAsync(url).then((hdrTexture) => {
      if (disposed) {
        hdrTexture.dispose();
        return;
      }

      hdrTexture.mapping = EquirectangularReflectionMapping;
      const pmrem = new PMREMGenerator(gl);
      envMap = pmrem.fromEquirectangular(hdrTexture).texture;
      hdrTexture.dispose();
      pmrem.dispose();

      scene.environment = envMap;
      scene.environmentIntensity = intensity;
    });

    return () => {
      disposed = true;
      scene.environment = null;
      scene.environmentIntensity = 1;
      envMap?.dispose();
    };
  }, [url, gl, scene, intensity]);

  useLayoutEffect(() => {
    scene.environmentIntensity = intensity;
  }, [scene, intensity]);

  return null;
}

export function HdriEnvironment({
  preset,
  intensity,
}: {
  preset: HdriPresetId;
  intensity: number;
}) {
  return (
    <Suspense fallback={null}>
      <HdriEnvironmentInner key={preset} preset={preset} intensity={intensity} />
    </Suspense>
  );
}
