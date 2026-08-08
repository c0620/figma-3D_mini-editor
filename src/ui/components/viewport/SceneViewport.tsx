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
import { useSessionStore } from "@/store/sessionStore";
import { useHandlers, useSceneObject } from "@/app/ApplicationKernelContext";
import {
  Box3,
  Object3D,
  PerspectiveCamera as ThreePerspectiveCamera,
  OrthographicCamera as ThreeOrthographicCamera,
  Group,
  Spherical,
  Vector3,
} from "three";
import React, {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CameraEditingHandlerPayload } from "@/handlers/cameraEditingHandler";
import { eulerFromLookAt } from "@/lib/cameraOrbit";

const CAMERA_EPSILON = 1e-3;

const _position = new Vector3();
const _target = new Vector3();
const _desiredPosition = new Vector3();
const _desiredTarget = new Vector3();
const _spherical = new Spherical();
const _contentBox = new Box3();

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
  const node = useSceneObject(id);

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

  const activeCamera =
    activeRef?.kind == "Camera"
      ? (scene.cameras[activeRef.id] as SceneCamera)
      : (scene.cameras[activeCameraID] as SceneCamera);

  const { camera } = useHandlers();

  const nodeRef = useRef<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const camRef = useRef<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const ccRef = useRef<CameraControls | null>(null);

  const contentRef = useRef<Group>(null);

  const [currentCamera, setCurrentCamera] = useState<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const [controls, setControls] = useState<CameraControls | null>(null);

  const attachCamera = useCallback(
    (instance: ThreePerspectiveCamera | ThreeOrthographicCamera | null) => {
      camRef.current = instance;
      setCurrentCamera(instance);
    },
    []
  );

  const attachControls = useCallback((instance: CameraControls | null) => {
    ccRef.current = instance;
    setControls(instance);
  }, []);

  const cameraID = activeCamera.id;
  const cameraType = activeCamera.type;
  const zoom = activeCamera.zoom;
  const dolly = activeCamera.dolly;
  const [positionX, positionY, positionZ] = activeCamera.transform.position;
  const [targetX, targetY, targetZ] = activeCamera.target;

  const persistCameraState = useCallback(() => {
    const controlsInstance = ccRef.current;
    const cameraInstance = camRef.current;
    if (!controlsInstance || !cameraInstance) return;

    controlsInstance.getPosition(_position);
    controlsInstance.getTarget(_target);
    controlsInstance.getSpherical(_spherical);

    const position = _position.toArray() as [number, number, number];
    const target = _target.toArray() as [number, number, number];

    const patch: CameraEditingHandlerPayload = {
      id: cameraID,
      transform: {
        position,
        rotation: eulerFromLookAt(position, target, cameraInstance.up),
        scale: cameraInstance.scale.toArray(),
      },
      azimuth: _spherical.theta,
      polar: _spherical.phi,
      target,
    };

    if (cameraType == CameraType.Perspective) patch.dolly = _spherical.radius;
    else patch.zoom = cameraInstance.zoom;
    camera.execute(patch);
  }, [camera, cameraID, cameraType]);

  useEffect(() => {
    if (!controls) return;

    _desiredPosition.set(positionX, positionY, positionZ);
    _desiredTarget.set(targetX, targetY, targetZ);
    controls.getPosition(_position);
    controls.getTarget(_target);

    if (
      _position.distanceTo(_desiredPosition) < CAMERA_EPSILON &&
      _target.distanceTo(_desiredTarget) < CAMERA_EPSILON
    )
      return;

    void controls.setLookAt(
      positionX,
      positionY,
      positionZ,
      targetX,
      targetY,
      targetZ,
      false
    );
  }, [controls, positionX, positionY, positionZ, targetX, targetY, targetZ]);

  useEffect(() => {
    if (
      !controls ||
      (cameraType == CameraType.Orthographic && zoom) ||
      (cameraType == CameraType.Perspective && dolly)
    ) {
      return;
    }

    const content = contentRef.current;
    if (!content) return;

    const cameraInstance = camRef.current;
    if (!cameraInstance) return;

    content.updateMatrixWorld(true);
    if (_contentBox.setFromObject(content).isEmpty()) return;

    void controls
      .fitToBox(content, false, {
        paddingTop: 0.5,
        paddingBottom: 0.5,
        paddingLeft: 0.5,
        paddingRight: 0.5,
      })
      .then(() => {
        controls.update(0);
        controls.getSpherical(_spherical);
        const patch = {
          id: activeCamera.id,
          [cameraType == CameraType.Perspective ? "dolly" : "zoom"]:
            cameraType == CameraType.Perspective
              ? _spherical.radius
              : cameraInstance.zoom,
        };

        camera.execute(patch);
      });
  }, [controls]);

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
              ref={attachControls}
              camera={currentCamera}
              enabled={!activeCamera.locked}
              onRest={persistCameraState}
            />
          )}
          {cameraType == CameraType.Perspective ? (
            <PerspectiveCamera
              makeDefault
              ref={attachCamera}
              position={activeCamera.transform.position}
              rotation={activeCamera.transform.rotation}
              near={activeCamera.near}
              far={activeCamera.far}
              fov={activeCamera.fov}
              aspect={isCameraPreview ? ratioW / ratioH : undefined}
              manual={isCameraPreview}
              key={activeCamera.id}
            />
          ) : (
            <OrthographicCamera
              makeDefault
              ref={attachCamera}
              position={activeCamera.transform.position}
              rotation={activeCamera.transform.rotation}
              zoom={activeCamera.zoom ?? 1}
              near={activeCamera.near}
              far={activeCamera.far}
              key={activeCamera.id}
            />
          )}
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <group ref={contentRef}>
            {scene.sceneGraph.roots.map((oid) => (
              <SceneNode id={oid} activeId={activeRef?.id} ref={nodeRef} />
            ))}
          </group>
          {activeRef && activeRef.kind != "Camera" && (
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
