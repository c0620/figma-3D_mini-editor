import type { Light } from "../types/scene";
import { randomUUID } from "../lib/randomId";

import { useSceneStore } from "../store/sceneStore";

import { SceneToolHandler } from "./sceneToolHandler";

export class LightAdditionHandler extends SceneToolHandler {
  execute(payload: object): void {
    const incoming = payload as Partial<Light>;
    const light: Light = {
      id: incoming.id ?? randomUUID(),
      type: incoming.type ?? "Directional",
      color: incoming.color ?? "#ffffff",
      intensity: incoming.intensity ?? 1,
      visible: incoming.visible ?? true,
      locked: incoming.locked ?? false,
      transform: incoming.transform ?? {
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      pendingDelete: incoming.pendingDelete ?? false,
    };

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
