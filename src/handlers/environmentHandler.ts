import type { EnvironmentState } from "@/types/scene";
import { CommandType, type HistoryEntry } from "@/types/commands";
import type { EnvironmentPatch } from "../store/sceneStore";
import { SceneToolHandler } from "./sceneToolHandler";

export class EnvironmentHandler extends SceneToolHandler<
  EnvironmentPatch,
  EnvironmentState
> {
  execute(payload: EnvironmentPatch): void {
    this.scene.patchEnvironment(payload);
  }

  getStateBeforeExecute(
    payload: EnvironmentPatch
  ): HistoryEntry<EnvironmentState> {
    const env = this.scene.getEnvironment();
    if (!env)
      throw new Error(
        "getStateBeforeExecute(environmentHandler): no environment"
      );

    const type =
      "shadowsEnabled" in payload &&
      Object.keys(payload).length === 1
        ? CommandType.ToggleShadows
        : CommandType.SetBackground;

    return { type, snapshot: env };
  }
}
