import { CameraControls, Outlines, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../io/threeAssetRegistry";
import type { SceneObject } from "../../../types/scene";
import { useSessionStore } from "@/store/sessionStore";
import { useHandlers } from "@/app/ApplicationKernelContext";
import { Mesh, Object3D } from "three";
import React, { type RefObject, useRef } from "react";

function SceneObjectMesh({
  object,
  isActive,
  ref,
}: {
  object: SceneObject;
  isActive: boolean;
  ref?: RefObject<Mesh | null>;
}) {
  const asset = threeAssetRegistry.get(object.id);
  if (!asset) return null;

  return (
    <>
      <mesh
        ref={ref}
        geometry={asset.geometry}
        material={
          Array.isArray(asset.material) ? asset.material[0] : asset.material
        }
        position={object.transform.position}
        rotation={object.transform.rotation}
        scale={object.transform.scale}
        visible={object.visible}
        name={object.name}
      >
        {isActive && <Outlines thickness={3} color="orange" />}
      </mesh>
    </>
  );
}

export function SceneRenderer() {
  const scene = useSceneStore((s) => s.scene);
  const activeId = useSessionStore((s) => s.activeObjectId);
  if (!scene) return null;

  const { base } = useHandlers();
  const activeTool = useSessionStore((s) => s.activeObjectTool);
  const meshRef = useRef<Mesh>(null);

  const handleTransformControls = () => {
    const transformObj = meshRef.current!;
    switch (activeTool) {
      case "translate":
        base.execute({
          id: activeId,
          position: [
            transformObj.position.x,
            transformObj.position.y,
            transformObj.position.z,
          ],
        });
        break;
      case "rotate":
        base.execute({
          id: activeId,
          rotation: [
            transformObj.rotation.x,
            transformObj.rotation.y,
            transformObj.rotation.z,
          ],
        });
        break;
      case "scale":
        base.execute({
          id: activeId,
          scale: [
            transformObj.scale.x,
            transformObj.scale.y,
            transformObj.scale.z,
          ],
        });
        break;
    }
  };

  return (
    <div className="canvas" style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: scene.camera.transform.position }}>
        <CameraControls makeDefault />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {scene.objects.map((obj) => {
          const isActive = activeId === obj.id;
          if (!isActive) {
            return (
              <SceneObjectMesh key={obj.id} object={obj} isActive={false} />
            );
          }

          return (
            <>
              <SceneObjectMesh
                key={obj.id}
                object={obj}
                isActive
                ref={meshRef}
              />
              {meshRef && activeTool && (
                <TransformControls
                  key={`${obj.id}-${activeTool}`}
                  mode={activeTool ? activeTool : undefined}
                  onMouseUp={handleTransformControls}
                  object={meshRef as RefObject<Object3D>}
                />
              )}
            </>
          );
        })}
      </Canvas>
    </div>
  );
}
