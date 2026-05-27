import { useSceneStore } from "../store/sceneStore";
import { SceneToolHandler } from "./sceneToolHandler";

export class EnvironmentHandler extends SceneToolHandler {
  execute(payload: object): void {
    useSceneStore.setState((state) => {
      if (!state.scene) return state;
      return {
        scene: {
          ...state.scene,
          environment: { ...state.scene.environment, ...payload },
        },
      };
    });
  }
}
