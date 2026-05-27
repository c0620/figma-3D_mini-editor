import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { Object3D } from "three";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";

import { useHandlers } from "@/app/ApplicationKernelContext";
import type { TransformObjectInversePayload } from "@/handlers/baseToolHandler";
import {
  captureTransformSnapshotFromStore,
  forwardPayloadFromSnapshot,
  transformSnapshotsEqual,
} from "@/lib/transformSnapshot";
import { useSessionStore } from "@/store/sessionStore";
import type { ActiveTransformToolMode, TransformToolMode } from "@/types/ui";

function resolveGizmoMode(
  transformToolMode: ActiveTransformToolMode,
  scaleEnabled: boolean
): TransformToolMode | null {
  if (transformToolMode === null) return null;
  if (transformToolMode === "scale" && !scaleEnabled) return null;
  return transformToolMode;
}

function readTransformFromObject(object: Object3D) {
  return {
    position: object.position.toArray() as [number, number, number],
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z] as [
      number,
      number,
      number,
    ],
    scale: object.scale.toArray() as [number, number, number],
  };
}

export function SceneTransformGizmo({
  entityId,
  objectRef,
  isActive,
  locked,
  scaleEnabled = true,
}: {
  entityId: string;
  objectRef: RefObject<Object3D | null | undefined>;
  isActive: boolean;
  locked: boolean;
  scaleEnabled?: boolean;
}) {
  const transformToolMode = useSessionStore((s) => s.transformToolMode);
  const { base, transform } = useHandlers();
  const controls = useThree((s) => s.controls);
  const gizmoMode = resolveGizmoMode(transformToolMode, scaleEnabled);
  const dragStartSnapshot = useRef<TransformObjectInversePayload | null>(null);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (objectRef.current) forceRender((n) => n + 1);
  }, [objectRef, isActive]);

  const setCameraControlsEnabled = useCallback(
    (enabled: boolean) => {
      const cameraControls = controls as CameraControlsImpl | null;
      if (cameraControls && "enabled" in cameraControls) {
        cameraControls.enabled = enabled;
      }
    },
    [controls]
  );

  const handleChange = useCallback(() => {
    const object = objectRef.current;
    if (!object) return;
    const { position, rotation, scale } = readTransformFromObject(object);
    base.execute({ id: entityId, position, rotation, scale });
  }, [base, entityId, objectRef]);

  const handleMouseDown = useCallback(() => {
    dragStartSnapshot.current = captureTransformSnapshotFromStore(entityId);
    setCameraControlsEnabled(false);
  }, [entityId, setCameraControlsEnabled]);

  const handleMouseUp = useCallback(() => {
    setCameraControlsEnabled(true);

    const startSnapshot = dragStartSnapshot.current;
    dragStartSnapshot.current = null;
    if (!startSnapshot) return;

    const endSnapshot = captureTransformSnapshotFromStore(entityId);
    if (!endSnapshot || transformSnapshotsEqual(startSnapshot, endSnapshot)) return;

    transform.commit(forwardPayloadFromSnapshot(endSnapshot), startSnapshot);
  }, [entityId, setCameraControlsEnabled, transform]);

  if (!isActive || locked || !gizmoMode || !objectRef.current) return null;

  return (
    <TransformControls
      object={objectRef.current}
      mode={gizmoMode}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
}
