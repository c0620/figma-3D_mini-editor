import type { Light } from "../types/scene";
import { createDefaultLight } from "../lights/lightDefaults";

import { useSceneStore } from "../store/sceneStore";

import { SceneToolHandler } from "./sceneToolHandler";

export class LightAdditionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const incoming = payload as Partial<Light>;
    const light = createDefaultLight(incoming);

    useSceneStore.setState((state) => {
      if (!state.scene) return state;
      return {
        scene: {
          ...state.scene,
          lights: [...state.scene.lights, light],
        },
      };
    });
  }
}
