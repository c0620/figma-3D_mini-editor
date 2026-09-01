import {
  CameraControls,
  Helper,
  OrthographicCamera,
  Outlines,
  PerspectiveCamera,
  TransformControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../store/threeAssetRegistry";
import { useViewportObjectStore } from "@/store/viewportObjectStore";
import {
  CameraType,
  LightType,
  type ObjectID,
  type ObjectRef,
  type SceneCamera,
  type SceneLight,
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
  SpotLightHelper,
  SpotLight,
  PointLightHelper,
} from "three";
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
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

function SceneObjectLight({
  light,
  isActive,
}: {
  light: SceneLight;
  isActive: boolean;
}) {
  const dummyRef = useRef<Object3D>(null);
  const lightRef = useRef<SpotLight>(null);
  const targetObject = useViewportObjectStore((s) =>
    light.target ? s.byId[light.target] : undefined
  );

  useLayoutEffect(() => {
    const spot = lightRef.current;
    if (!spot) return;
    const nextTarget = targetObject ?? dummyRef.current;
    if (nextTarget) spot.target = nextTarget;
  }, [targetObject, light.type]);

  switch (light.type) {
    case LightType.Spot:
      return (
        <spotLight
          ref={(instance) => {
            lightRef.current = instance;
            if (instance) {
              useViewportObjectStore
                .getState()
                .registerLight(light.id, instance);
              if (targetObject) instance.target = targetObject;
            } else useViewportObjectStore.getState().unregisterLight(light.id);
          }}
          color={light.color.value}
          distance={light.distance}
          decay={light.decay}
          penumbra={light.penumbra}
          angle={light.angle}
          intensity={light.intensity}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={[1, 1, 1]}
        >
          <object3D ref={dummyRef} position={[0, 0, -1]} />
          {isActive && <Helper type={SpotLightHelper} />}
        </spotLight>
      );
    case LightType.Point:
      return (
        <pointLight
          ref={(instance) => {
            if (instance)
              useViewportObjectStore
                .getState()
                .registerLight(light.id, instance);
            else useViewportObjectStore.getState().unregisterLight(light.id);
          }}
          color={light.color.value}
          intensity={light.intensity}
          distance={light.distance}
          decay={light.decay}
        >
          {isActive && <Helper type={PointLightHelper} />}
        </pointLight>
      );
    case LightType.Ambient:
      return (
        <ambientLight
          ref={(instance) => {
            if (instance)
              useViewportObjectStore
                .getState()
                .registerLight(light.id, instance);
            else useViewportObjectStore.getState().unregisterLight(light.id);
          }}
          color={light.color.value}
          intensity={light.intensity}
        />
      );
    case LightType.HDRI:
      throw new Error("SceneObjectLight: HDRI node is not implemented");
  }
}

function SceneObjectControls({
  activeRef,
  ref,
  setUsing,
}: {
  activeRef: ObjectRef;
  ref: RefObject<Object3D>;
  setUsing: Dispatch<SetStateAction<boolean>>;
}) {
  const { transform } = useHandlers();
  const activeTool = useSessionStore((s) => s.activeObjectTool);
  const targetedLight = useSceneStore((s) =>
    activeRef.kind === "Light" ? s.scene?.lights[activeRef.id] : undefined
  );
  const tool =
    activeTool === "rotate" && targetedLight?.target ? null : activeTool;

  const handleTransformControls = () => {
    const transformObj = ref.current!;
    switch (tool) {
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

  if (tool) {
    return (
      <TransformControls
        key={`${activeRef.id}-controls`}
        mode={tool}
        onMouseUp={() => {
          handleTransformControls();
          setUsing(false);
        }}
        object={ref as RefObject<Object3D>}
        space="local"
        onMouseDown={() => setUsing(true)}
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
  const groupRef = useRef<Group>(null);

  const childrenIDs = useSceneStore((s) => s.scene!.sceneGraph.graphThree[id]);

  const attachGroup = useCallback(
    (instance: Group | null) => {
      groupRef.current = instance;
      if (instance) useViewportObjectStore.getState().register(id, instance);
      else useViewportObjectStore.getState().unregister(id);
    },
    [id]
  );

  const isActive = node?.id === activeId;

  useLayoutEffect(() => {
    if (!isActive) return;
    ref.current = groupRef.current;
  }, [isActive, ref]);

  if (!node || node.pendingDelete) return null;

  return (
    <>
      <group
        position={node.transform.position}
        rotation={node.transform.rotation}
        scale={node.transform.scale}
        visible={"visible" in node ? node.visible : true}
        name={node.name}
        ref={attachGroup}
      >
        {node.kind === "Mesh" && (
          <SceneObjectMesh
            object={node}
            isActive={isActive}
            key={`sceneMesh-${node.id}`}
          />
        )}
        {node.kind === "Light" && (
          <SceneObjectLight light={node} isActive={isActive} />
        )}
        {(childrenIDs ?? []).map((cid) => (
          <SceneNode key={cid} id={cid} activeId={activeId} ref={ref} />
        ))}
      </group>
    </>
  );
}

export function SceneRenderer() {
  const scene = useSceneStore((s) => s.scene)!;
  const activeRef = useSessionStore((s) => s.activeObjectRef);
  const isCameraPreview = useSessionStore((s) => s.isCameraPreview);
  const activeCameraID = useSessionStore((s) => s.activeCameraID);

  const { camera } = useHandlers();

  const activeCamera =
    activeRef?.kind == "Camera"
      ? (scene.cameras[activeRef.id] as SceneCamera)
      : (scene.cameras[activeCameraID] as SceneCamera);

  const nodeRef = useRef<Object3D>(null);

  const camRef = useRef<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const ccRef = useRef<CameraControls | null>(null);

  const contentRef = useRef<Group>(null);

  const [currentCamera, setCurrentCamera] = useState<
    ThreePerspectiveCamera | ThreeOrthographicCamera | null
  >(null);

  const [CC, setCC] = useState<CameraControls | null>(null);

  const [isUsingTransforms, setIsUsingTranforms] = useState(false);

  const attachCamera = useCallback(
    (instance: ThreePerspectiveCamera | ThreeOrthographicCamera | null) => {
      camRef.current = instance;
      setCurrentCamera(instance);
    },
    []
  );

  const attachControls = useCallback((instance: CameraControls | null) => {
    ccRef.current = instance;
    setCC(instance);
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
    if (!CC) return;

    _desiredPosition.set(positionX, positionY, positionZ);
    _desiredTarget.set(targetX, targetY, targetZ);
    CC.getPosition(_position);
    CC.getTarget(_target);

    if (
      _position.distanceTo(_desiredPosition) < CAMERA_EPSILON &&
      _target.distanceTo(_desiredTarget) < CAMERA_EPSILON
    )
      return;

    void CC.setLookAt(
      positionX,
      positionY,
      positionZ,
      targetX,
      targetY,
      targetZ,
      false
    );
  }, [CC, positionX, positionY, positionZ, targetX, targetY, targetZ]);

  useEffect(() => {
    if (!CC || cameraType !== CameraType.Orthographic || zoom == null) return;
    if (Math.abs(CC.camera.zoom - zoom) < CAMERA_EPSILON) return;
    void CC.zoomTo(zoom, false);
  }, [CC, cameraType, zoom]);

  useEffect(() => {
    if (
      !CC ||
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

    void CC.fitToBox(content, false, {
      paddingTop: 0.5,
      paddingBottom: 0.5,
      paddingLeft: 0.5,
      paddingRight: 0.5,
    }).then(() => {
      CC.update(0);
      CC.getSpherical(_spherical);
      const patch = {
        id: activeCamera.id,
        [cameraType == CameraType.Perspective ? "dolly" : "zoom"]:
          cameraType == CameraType.Perspective
            ? _spherical.radius
            : cameraInstance.zoom,
      };

      camera.execute(patch);
    });
  }, [CC]);

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
              enabled={!activeCamera.locked && !isUsingTransforms}
              onRest={persistCameraState}
            />
          )}
          {cameraType == CameraType.Perspective ? (
            <PerspectiveCamera
              makeDefault
              ref={attachCamera}
              near={activeCamera.near}
              far={activeCamera.far}
              fov={activeCamera.fov}
              manual={isCameraPreview}
              key={activeCamera.id}
            />
          ) : (
            <OrthographicCamera
              makeDefault
              ref={attachCamera}
              near={activeCamera.near}
              far={activeCamera.far}
              key={activeCamera.id}
            />
          )}
          <group ref={contentRef}>
            {scene.sceneGraph.roots.map((oid) => (
              <SceneNode
                key={oid}
                id={oid}
                activeId={activeRef?.id}
                ref={nodeRef}
              />
            ))}
          </group>
          {activeRef && activeRef.kind != "Camera" && (
            <SceneObjectControls
              activeRef={activeRef}
              ref={nodeRef as RefObject<Object3D>}
              key={`controls-${activeRef.id}`}
              setUsing={setIsUsingTranforms}
            />
          )}
        </Canvas>
      </div>
    </div>
  );
}
