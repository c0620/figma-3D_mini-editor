import {
  CameraType,
  LightType,
  type ObjectID,
  type SceneCamera,
  type SceneGroup,
  type SceneLight,
  type SceneMesh,
} from "../types/scene";
import { CommandType, type HistoryEntry } from "@/types/commands";

import { SceneToolHandler } from "./sceneToolHandler";
import type {
  DeletionHandler,
  DeletionHandlerPayload,
} from "./deletionHandler";
import { Color } from "three";

export type ObjectAdditionHandlerPayload =
  | (Partial<Omit<SceneLight, "id" | "kind">> & Pick<SceneLight, "id" | "kind">)
  | (Partial<Omit<SceneCamera, "id" | "kind">> &
      Pick<SceneCamera, "id" | "kind">)
  | (Partial<Omit<SceneMesh, "id" | "kind">> & Pick<SceneMesh, "id" | "kind">)
  | Pick<SceneGroup, "id" | "kind">;

type ObjectAdditionHandlerSnapshot = DeletionHandlerPayload;

export class ObjectAdditionHandler extends SceneToolHandler<
  ObjectAdditionHandlerPayload,
  ObjectAdditionHandlerSnapshot
> {
  execute(payload: ObjectAdditionHandlerPayload): void {
    const incoming = payload;
    switch (incoming.kind) {
      case "Camera":
        const camera: SceneCamera = {
          id: incoming.id,
          kind: "Camera",
          type: incoming.type ?? CameraType.Perspective,
          zoom: incoming.zoom ?? null,
          transform: {
            position: incoming.transform?.position ?? [0, 0, 5],
            rotation: incoming.transform?.rotation ?? [0, 0, 0],
            scale: incoming.transform?.scale ?? [1, 1, 1],
          },
          locked: false,
          near: incoming.type
            ? incoming.type == CameraType.Perspective
              ? 0.1
              : 0
            : 0.1,
          far: incoming.far ?? 1000,
          fov: incoming.fov ?? 50,
          aspect: incoming.aspect ?? [1, 1],
          dolly: incoming.dolly ?? null,
          azimuth: incoming.azimuth ?? 0,
          polar: incoming.polar ?? 0,
          target: incoming.target ?? [0, 0, 0],
          name: incoming.name ?? "Perspective Camera",
          pendingDelete: false,
          parentId: null,
        };
        this.scene.addObject(camera);
        return;
      case "Light":
        const light: SceneLight = {
          id: incoming.id,
          type: incoming.type ?? LightType.Spot,
          color: incoming.color ?? {
            type: "custom",
            value: new Color().setHex(0xffffff),
          },
          intensity: incoming.intensity ?? 1,
          visible: incoming.visible ?? true,
          locked: incoming.locked ?? false,
          kind: "Light",
          pendingDelete: false,
          parentId: null,
          name: `Light${Object.values(this.scene.getScene().lights).length}`,
          transform: incoming.transform ?? {
            position: [0, 5, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
          distance: 0,
          angle: Math.PI / 3,
          penumbra: 0,
          decay: 2,
          target: incoming.target ?? null,
        };
        this.scene.addObject(light);
        return;
      case "Mesh":
        throw new Error(
          "execute(ObjectAdditionHandler): Mesh addition is not implemented"
        );
        return;
      case "Group":
        this.scene.setActiveObjectRef({ id: incoming.id, kind: incoming.kind });
        return;
    }
  }

  getStateBeforeExecute(
    payload: ObjectAdditionHandlerPayload
  ): HistoryEntry<ObjectAdditionHandlerSnapshot> {
    const { id, kind } = payload;
    return {
      type: CommandType.DeleteObject,
      snapshot: { id, isDelete: true, kind },
    };
  }
}
