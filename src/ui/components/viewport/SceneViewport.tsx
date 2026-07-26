import {
  CameraControls,
  OrthographicCamera,
  Outlines,
  PerspectiveCamera,
  TransformControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../store/threeAssetRegistry";
import {
  CameraType,
  type ObjectID,
  type ObjectRef,
  type SceneCamera,
  type SceneObject,
} from "../../../types/scene";
import { useSessionStore, type ObjectToolMode } from "@/store/sessionStore";
import { useHandlers } from "@/app/ApplicationKernelContext";
import {
  Mesh,
  Object3D,
  PerspectiveCamera as ThreePerspectiveCamera,
  OrthographicCamera as ThreeOrthographicCamera,
  Group,
} from "three";
import React, { type RefObject, useEffect, useRef, useState } from "react";
import { IDs } from "@/io/sceneEncoder";
import type { CameraEditingHandlerPayload } from "@/handlers/cameraEditingHandler";

function SceneObjectMesh({
  object,
  isActive,
}: {
  object: SceneObject;
  isActive: boolean;
}) {
  const asset = threeAssetRegistry.getAssetData(object.id);
  if (!asset) return null;

  const mats = asset.materials.map(
    (matID) => threeAssetRegistry.materials[matID].material
  );
  const material = mats.length === 1 ? mats[0] : mats;

  return (
    <>
      <mesh geometry={asset.geometry} material={material} name={object.name}>
        {isActive && <Outlines thickness={3} color="#ff5900" />}
      </mesh>
    </>
  );
}

function SceneObjectLight() {
  return <ambientLight />;
}

function SceneObjectControls({
  activeRef,
  ref,
}: {
  activeRef: ObjectRef;
  ref: RefObject<Object3D>;
}) {
  const { transform } = useHandlers();
  const activeTool = useSessionStore((s) => s.activeObjectTool);

  const handleTransformControls = () => {
    const transformObj = ref.current!;
    switch (activeTool) {
      case "translate":
        transform.execute({
          objectRef: activeRef,
          position: [
            transformObj.position.x,
            transformObj.position.y,
            transformObj.position.z,
          ],
        });
        break;
      case "rotate":
        transform.execute({
          objectRef: activeRef,
          rotation: [
            transformObj.rotation.x,
            transformObj.rotation.y,
            transformObj.rotation.z,
          ],
        });
        break;
      case "scale":
        transform.execute({
          objectRef: activeRef,
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
        key={`${activeRef.id}-controls`}
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
  ref,
}: {
  id: ObjectID;
  activeId: ObjectID | undefined;
  ref: RefObject<Object3D | null>;
}) {
  const node = useSceneStore((s) => s.scene!.sceneGraph.objects[id]);
  const childrenIDs = useSceneStore((s) => s.scene!.sceneGraph.graphThree[id]);

  if (!node || node.pendingDelete) return null;

  const isActive = node.id === activeId;

  return (
    <>
      <group
        position={node.transform.position}
        rotation={node.transform.rotation}
        scale={node.transform.scale}
        visible={"visible" in node ? node.visible : true}
        name={node.name}
        ref={node.id === activeId ? ref : null}
      >
        {node.kind === "Mesh" && (
          <SceneObjectMesh
            object={node}
            isActive={isActive}
            key={`sceneMesh-${node.id}`}
          />
        )}
        {node.kind === "Light" && <SceneObjectLight />}
        {(childrenIDs ?? []).map((cid) => (
          <SceneNode key={cid} id={cid} activeId={activeId} ref={ref} />
        ))}
      </group>
    </>
  );
}

export function SceneRenderer() {
  const scene = useSceneStore((s) => s.scene);
  if (!scene) return null;
  const activeRef = useSessionStore((s) => s.activeObjectRef);
  const isCameraPreview = useSessionStore((s) => s.isCameraPreview);
  const activeCameraID = useSessionStore((s) => s.activeCameraID);
  const activeCamera = scene.sceneGraph.objects[activeCameraID] as SceneCamera; //ToDO: change to current camera

  const { camera } = useHandlers();

  const nodeRef = useRef<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const camRef = useRef<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const [currentCamera, setCurrentCamera] = useState<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const ccRef = useRef<CameraControls | null>(null);

  const contentRef = useRef<Group>(null);

  useEffect(() => {
    setCurrentCamera(camRef.current);
  }, []);

  useEffect(() => {
    if (!ccRef.current || !contentRef.current) return;
    contentRef.current.updateMatrixWorld(true);
    ccRef.current.fitToBox(contentRef.current, false, {
      paddingTop: 0.5,
      paddingBottom: 0.5,
      paddingLeft: 0.5,
      paddingRight: 0.5,
    });
  }, [currentCamera]);

  useEffect(() => {
    if (activeCamera.type == CameraType.Perspective)
      ccRef.current?.dollyTo(activeCamera.dolly);
    else if (activeCamera.type == CameraType.Orthographic)
      ccRef.current?.zoomTo(activeCamera.zoom);
    else
      throw new Error("SceneRenderer(SceneViewport): unknown type of camera");
  }, [ccRef, activeCamera.dolly, activeCamera.zoom]);

  useEffect(() => {
    const c = ccRef.current;
    if (!c) return;
    const [x, y, z] = activeCamera.transform.position;
    const azimuth = activeCamera.azimuth ?? 0;
    const polar = activeCamera.polar ?? Math.PI / 2;
    c.setPosition(x, y, z, true);
    c.rotateTo(azimuth, polar);
  }, [
    activeCamera.transform.position,
    activeCamera.transform.rotation,
    activeCamera.azimuth,
    activeCamera.polar,
  ]);

  const { innerWidth: windowW, innerHeight: windowH } = window;
  const ratioMx =
    Math.max(innerWidth, innerHeight) / Math.min(innerWidth, innerHeight);
  const ratioMn =
    Math.min(innerWidth, innerHeight) / Math.max(innerWidth, innerHeight);

  const ratioW = activeCamera.aspect[0];
  const ratioH = activeCamera.aspect[1];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        className="canvas"
        style={
          isCameraPreview
            ? {
                width:
                  (ratioW /
                    (Math.max(ratioW, ratioH) *
                      (windowW > windowH ? ratioMx : 1))) *
                    100 +
                  "%",
                height:
                  (ratioH / Math.max(ratioW, ratioH)) *
                    (windowH > windowW ? ratioMn : 1) *
                    100 +
                  "%",
                border: "3px solid orange",
              }
            : { width: "100%", height: "100%" }
        }
      >
        <Canvas>
          {currentCamera && (
            <CameraControls
              ref={ccRef}
              camera={currentCamera}
              enabled
              onRest={() => {
                const controls = ccRef.current;
                if (!controls) return;

                const patch: CameraEditingHandlerPayload = {
                  id: activeCameraID,
                  transform: {
                    position: currentCamera.position.toArray(),
                    rotation: [
                      currentCamera.rotation.x,
                      currentCamera.rotation.y,
                      currentCamera.rotation.z,
                    ],
                    scale: currentCamera.scale.toArray(),
                  },
                  azimuth: controls.azimuthAngle,
                  polar: controls.polarAngle,
                };

                if (camRef.current?.type == CameraType.Perspective) {
                  patch.dolly = controls.distance;
                } else {
                  patch.zoom = currentCamera.zoom;
                }

                camera.execute(patch);
              }}
            />
          )}
          {activeCamera.type == CameraType.Perspective ? (
            <PerspectiveCamera
              makeDefault
              ref={(r) => {
                setCurrentCamera(r);
                camRef.current = r;
              }}
              position={activeCamera.transform.position}
              rotation={activeCamera.transform.rotation}
              scale={activeCamera.transform.scale}
              near={activeCamera.near}
              far={activeCamera.far}
              fov={activeCamera.fov}
              aspect={isCameraPreview ? ratioW / ratioH : undefined}
              manual={isCameraPreview}
            />
          ) : (
            <OrthographicCamera
              makeDefault
              ref={(r) => {
                setCurrentCamera(r);
                camRef.current = r;
              }}
              position={activeCamera.transform.position}
              rotation={activeCamera.transform.rotation}
              scale={activeCamera.transform.scale}
              zoom={activeCamera.zoom}
              near={activeCamera.near}
              far={activeCamera.far}
            />
          )}
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <group ref={contentRef}>
            {scene.sceneGraph.roots.map((oid) => (
              <SceneNode id={oid} activeId={activeRef?.id} ref={nodeRef} />
            ))}
          </group>
          {activeRef && (
            <SceneObjectControls
              activeRef={activeRef}
              ref={nodeRef as RefObject<Object3D>}
              key={`controls-${activeRef.id}`}
            />
          )}
        </Canvas>
      </div>
    </div>
  );
}
