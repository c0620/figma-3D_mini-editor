import { CameraControls, Outlines, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../store/threeAssetRegistry";
import type { CameraID, ObjectID, SceneObject } from "../../../types/scene";
import { useSessionStore, type ObjectToolMode } from "@/store/sessionStore";
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

  const mats = asset.materials.map(
    (matID) => threeAssetRegistry.materials[matID].material
  );
  const material = mats.length === 1 ? mats[0] : mats;

  return (
    <>
      <mesh
        ref={ref}
        geometry={asset.geometry}
        material={material}
        name={object.name}
      >
        {isActive && <Outlines thickness={3} color="orange" />}
      </mesh>
    </>
  );
}

function SceneObjectLight() {
  return <ambientLight />;
}

function SceneObjectControls({
  activeRefID,
  ref,
}: {
  activeRefID: ObjectID;
  ref: RefObject<Object3D>;
}) {
  const { transform } = useHandlers();
  const activeTool = useSessionStore((s) => s.activeObjectTool);

  const handleTransformControls = () => {
    const transformObj = ref.current!;
    switch (activeTool) {
      case "translate":
        transform.execute({
          id: activeRefID,
          position: [
            transformObj.position.x,
            transformObj.position.y,
            transformObj.position.z,
          ],
        });
        break;
      case "rotate":
        transform.execute({
          id: activeRefID,
          rotation: [
            transformObj.rotation.x,
            transformObj.rotation.y,
            transformObj.rotation.z,
          ],
        });
        break;
      case "scale":
        transform.execute({
          id: activeRefID,
          scale: [
            transformObj.scale.x,
            transformObj.scale.y,
            transformObj.scale.z,
          ],
        });
        break;
    }
  };

  if (activeTool) {
    return (
      <TransformControls
        key={`${activeRefID}-controls`}
        mode={activeTool ? activeTool : undefined}
        onMouseUp={handleTransformControls}
        object={ref as RefObject<Object3D>}
        space="local"
      />
    );
  }

  return null;
}

function SceneNode({
  id,
  activeId,
}: {
  id: ObjectID;
  activeId: ObjectID | CameraID | undefined;
}) {
  const nodeRef = useRef<Mesh>(null);
  const node = useSceneStore((s) => s.scene!.sceneGraph.objects[id]);
  const childrenIDs = useSceneStore((s) => s.scene!.sceneGraph.graphThree[id]);

  if (!node || node.pendingDelete) return null;

  const isActive = node.id === activeId;

  return (
    <group
      position={node.transform.position}
      rotation={node.transform.rotation}
      scale={node.transform.scale}
      visible={node.visible}
      name={node.name}
    >
      {node.kind === "Mesh" && (
        <SceneObjectMesh
          object={node}
          isActive={isActive}
          ref={isActive ? nodeRef : undefined}
          key={`sceneMesh-${node.id}`}
        />
      )}
      {isActive && (
        <SceneObjectControls
          activeRefID={node.id}
          ref={nodeRef as RefObject<Object3D>}
          key={`controls-${node.id}`}
        />
      )}
      {node.kind === "Light" && <SceneObjectLight />}
      {(childrenIDs ?? []).map((cid) => (
        <SceneNode key={cid} id={cid} activeId={activeId} />
      ))}
    </group>
  );
}

export function SceneRenderer() {
  const scene = useSceneStore((s) => s.scene);
  const activeRef = useSessionStore((s) => s.activeObjectRef);
  if (!scene) return null;

  return (
    <div className="canvas" style={{ width: "100%", height: "100%" }}>
      {/* hardcode camera id */}
      <Canvas camera={{ position: scene.cameras["1"].transform.position }}>
        <CameraControls makeDefault />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {scene.sceneGraph.roots.map((oid) => (
          <SceneNode id={oid} activeId={activeRef?.id} />
        ))}
      </Canvas>
    </div>
  );
}
