import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  CameraControls,
  OrthographicCamera,
  Outlines,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../store/threeAssetRegistry";
import {
  activeZoom,
  type CameraState,
  type Material,
  type SceneMesh,
} from "../../../types/scene";
import { resolveEmissiveForRender } from "../../../render/domainMaterialBuilder";
import { useSessionStore } from "@/store/sessionStore";
import { useMaterialGpuTextures } from "./useMaterialGpuTextures";
import { SceneLights } from "./SceneLights";
import type { Object3D } from "three";
import {
  Color,
  OrthographicCamera as ThreeOrthographicCamera,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import CameraControlsImplLib from "camera-controls";
import { useHandlers } from "@/app/ApplicationKernelContext";
import type { CameraPatch } from "@/store/sceneStore";
import type { CameraEditingHandler } from "@/handlers/cameraEditingHandler";
import { sceneCameraEntityId } from "@/store/sceneEntityList";
import { SceneTransformGizmo } from "./SceneTransformGizmo";
import { AspectPreviewOutline } from "./AspectPreviewOutline";
import { computeAspectRect } from "@/camera/aspectPreviewRect";
import styles from "./SceneViewport.module.css";

const ZOOM_EPSILON = 1e-4;
const DEFAULT_VIEWPORT_CLEAR_COLOR = 0x111111;

function SceneBackground({ color }: { color: string | null }) {
  const { scene, gl } = useThree();

  useLayoutEffect(() => {
    if (color) {
      scene.background = new Color(color);
    } else {
      scene.background = null;
    }
    gl.setClearColor(color ?? DEFAULT_VIEWPORT_CLEAR_COLOR);
  }, [color, scene, gl]);

  return null;
}

function hasTextureUrls(mat: Material): boolean {
  return Object.values(mat.textures).some((entry) => entry?.url != null);
}

function SolidMaterialSlot({ mat, attach }: { mat: Material; attach: string }) {
  const emissive = useMemo(() => resolveEmissiveForRender(mat), [mat]);

  return (
    <meshStandardMaterial
      attach={attach}
      color={mat.baseColor}
      roughness={mat.roughness}
      metalness={mat.metalness}
      emissive={emissive.color}
      emissiveIntensity={emissive.intensity}
    />
  );
}

function TexturedMaterialSlot({
  mat,
  attach,
}: {
  mat: Material;
  attach: string;
}) {
  const maps = useMaterialGpuTextures(mat.textures);
  const emissive = useMemo(() => resolveEmissiveForRender(mat), [mat]);

  return (
    <meshStandardMaterial
      attach={attach}
      color={mat.baseColor}
      roughness={mat.roughness}
      metalness={mat.metalness}
      emissive={emissive.color}
      emissiveIntensity={emissive.intensity}
      map={maps.map}
      normalMap={maps.normalMap}
      roughnessMap={maps.roughnessMap}
      metalnessMap={maps.metalnessMap}
      emissiveMap={maps.emissiveMap}
    />
  );
}

function MaterialSlotById({
  materialId,
  attach,
}: {
  materialId: string;
  attach: string;
}) {
  const mat = useSceneStore((s) => s.scene?.materials[materialId]);
  if (!mat) return null;

  if (!hasTextureUrls(mat)) {
    return <SolidMaterialSlot mat={mat} attach={attach} />;
  }

  return (
    <Suspense fallback={<SolidMaterialSlot mat={mat} attach={attach} />}>
      <TexturedMaterialSlot mat={mat} attach={attach} />
    </Suspense>
  );
}

function SceneObjectMesh({
  object,
  isActive,
}: {
  object: SceneMesh;
  isActive: boolean;
}) {
  const asset = threeAssetRegistry.get(object.id);

  if (!asset || !object) return null;

  const { transform, visible, materialIDs, name } = object;

  const meshRef = useRef<Object3D>(undefined);

  return (
    <>
      <mesh
        key={object.id}
        ref={meshRef}
        geometry={asset.geometry}
        position={transform.position}
        rotation={transform.rotation}
        scale={transform.scale}
        visible={visible}
        name={name}
      >
        {materialIDs.map((materialId, index) => (
          <MaterialSlotById
            key={materialId}
            materialId={materialId}
            attach={materialIDs.length === 1 ? "material" : `material-${index}`}
          />
        ))}
        {isActive && <Outlines thickness={3} color="#ff5900" />}
      </mesh>
      <SceneTransformGizmo
        entityId={object.id}
        objectRef={meshRef}
        isActive={isActive}
        locked={object.locked}
        scaleEnabled
      />
    </>
  );
}

function getProjectionAspect(
  state: CameraState,
  canvasWidth: number,
  canvasHeight: number
): number {
  if (!state.aspectPreviewEnabled) {
    return canvasHeight > 0 ? canvasWidth / canvasHeight : state.aspect;
  }
  const rect = computeAspectRect(canvasWidth, canvasHeight, state.aspect);
  return rect.height > 0 ? rect.width / rect.height : state.aspect;
}

function applyCameraProjectionAspect(
  camera: ThreePerspectiveCamera | ThreeOrthographicCamera,
  state: CameraState,
  canvasWidth: number,
  canvasHeight: number
): void {
  const projectionAspect = getProjectionAspect(
    state,
    canvasWidth,
    canvasHeight
  );

  camera.near = state.near;
  camera.far = state.far;

  if (camera instanceof ThreePerspectiveCamera) {
    camera.fov = state.fov;
    camera.aspect = projectionAspect;
  } else {
    // Единичный frustum: масштаб только через camera.zoom (как ожидает CameraControls).
    const halfH = 1;
    const halfW = halfH * projectionAspect;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
  }

  camera.updateProjectionMatrix();
}

function applyCameraProjection(
  camera: ThreePerspectiveCamera | ThreeOrthographicCamera,
  state: CameraState,
  canvasWidth: number,
  canvasHeight: number
): void {
  const zoom = activeZoom(state);
  camera.zoom = zoom;
  applyCameraProjectionAspect(camera, state, canvasWidth, canvasHeight);
}

function applyDomainCameraToControls(
  controls: CameraControlsImpl,
  camera: ThreePerspectiveCamera | ThreeOrthographicCamera,
  state: CameraState,
  canvasWidth: number,
  canvasHeight: number,
  opts?: { animateZoom?: boolean }
): void {
  const [px, py, pz] = state.transform.position;
  const [tx, ty, tz] = state.orbitTarget;
  const zoom = activeZoom(state);

  void controls.setLookAt(px, py, pz, tx, ty, tz, false);

  if (Math.abs(camera.zoom - zoom) > ZOOM_EPSILON) {
    void controls.zoomTo(zoom, opts?.animateZoom ?? false);
  }

  applyCameraProjection(camera, state, canvasWidth, canvasHeight);
}

function readControlsToCameraPatch(
  controls: CameraControlsImpl,
  camera: ThreePerspectiveCamera | ThreeOrthographicCamera,
  cameraType: CameraState["type"]
): CameraPatch {
  const target = new Vector3();
  controls.getTarget(target);

  const zoomPatch =
    cameraType === "Perspective"
      ? { perspectiveZoom: camera.zoom }
      : { orthographicZoom: camera.zoom };

  return {
    transform: {
      position: camera.position.toArray() as [number, number, number],
      rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z] as [
        number,
        number,
        number,
      ],
    },
    orbitTarget: target.toArray() as [number, number, number],
    ...zoomPatch,
  };
}

function commitControlsToStore(
  controls: CameraControlsImpl,
  camera: ThreePerspectiveCamera | ThreeOrthographicCamera,
  cameraType: CameraState["type"],
  handler: CameraEditingHandler,
  applyingFromStoreRef: MutableRefObject<boolean>,
  locked: boolean
): void {
  if (locked || applyingFromStoreRef.current) return;
  handler.execute(readControlsToCameraPatch(controls, camera, cameraType));
}

function AspectPreviewFraming({
  enabled,
  aspect,
}: {
  enabled: boolean;
  aspect: number;
}) {
  useFrame(({ gl, size }) => {
    if (!enabled) {
      gl.setScissorTest(false);
      gl.setViewport(0, 0, size.width, size.height);
      return;
    }

    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);
    gl.setClearColor(DEFAULT_VIEWPORT_CLEAR_COLOR);
    gl.clear(true, true, true);

    const rect = computeAspectRect(size.width, size.height, aspect);
    gl.setScissorTest(true);
    gl.setScissor(rect.x, rect.y, rect.width, rect.height);
    gl.setViewport(rect.x, rect.y, rect.width, rect.height);
  }, -1);

  return null;
}

function CameraProjectionSync({ state }: { state: CameraState }) {
  const { camera, size } = useThree();

  useFrame(() => {
    applyCameraProjectionAspect(
      camera as ThreePerspectiveCamera | ThreeOrthographicCamera,
      state,
      size.width,
      size.height
    );
  });

  return null;
}

function SceneCameraSync({ state }: { state: CameraState }) {
  const [controls, setControls] = useState<CameraControlsImpl | null>(null);
  const applyingFromStoreRef = useRef(false);
  const skipSyncFromControlsRef = useRef(false);
  const { camera, size } = useThree();
  const { camera: cameraHandler } = useHandlers();

  useLayoutEffect(() => {
    const threeCamera = camera as
      | ThreePerspectiveCamera
      | ThreeOrthographicCamera;

    applyCameraProjection(threeCamera, state, size.width, size.height);

    if (!controls) return;

    if (skipSyncFromControlsRef.current) {
      skipSyncFromControlsRef.current = false;
      return;
    }

    applyingFromStoreRef.current = true;

    applyDomainCameraToControls(
      controls,
      threeCamera,
      state,
      size.width,
      size.height,
      { animateZoom: true }
    );

    applyingFromStoreRef.current = false;
  }, [controls, camera, size.width, size.height, state]);

  useEffect(() => {
    if (!controls) return;
    controls.mouseButtons.wheel =
      state.type === "Perspective"
        ? CameraControlsImplLib.ACTION.DOLLY
        : CameraControlsImplLib.ACTION.ZOOM;
  }, [controls, state.type]);

  useEffect(() => {
    if (!controls) return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const threeCamera = camera as
      | ThreePerspectiveCamera
      | ThreeOrthographicCamera;

    const commit = () => {
      skipSyncFromControlsRef.current = true;
      commitControlsToStore(
        controls,
        threeCamera,
        state.type,
        cameraHandler,
        applyingFromStoreRef,
        state.locked
      );
    };

    const onControl = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(commit, 80);
    };

    const onControlEnd = () => {
      clearTimeout(debounceTimer);
      commit();
    };

    controls.addEventListener("control", onControl);
    controls.addEventListener("controlend", onControlEnd);
    return () => {
      clearTimeout(debounceTimer);
      controls.removeEventListener("control", onControl);
      controls.removeEventListener("controlend", onControlEnd);
    };
  }, [controls, camera, cameraHandler, state.locked]);

  return (
    <>
      <CameraControls
        ref={setControls}
        makeDefault
        enabled={!state.locked}
        smoothTime={0.25}
        draggingSmoothTime={0.125}
      />
      <CameraProjectionSync state={state} />
      <AspectPreviewFraming
        enabled={state.aspectPreviewEnabled}
        aspect={state.aspect}
      />
    </>
  );
}

function SceneCameraTransformGizmo({
  sceneId,
  activeId,
  locked,
}: {
  sceneId: string;
  activeId: string | null;
  locked: boolean;
}) {
  const cameraEntityId = sceneCameraEntityId(sceneId);
  const isActive = activeId === cameraEntityId;
  const { camera } = useThree();
  const cameraRef = useRef<Object3D>(camera);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  return (
    <SceneTransformGizmo
      entityId={cameraEntityId}
      objectRef={cameraRef}
      isActive={isActive}
      locked={locked}
      scaleEnabled={false}
    />
  );
}

function SceneCameraRig({
  state,
  sceneId,
  activeId,
}: {
  state: CameraState;
  sceneId: string;
  activeId: string | null;
}) {
  return (
    <>
      {state.type === "Perspective" ? (
        <PerspectiveCamera
          key="perspective"
          manual
          makeDefault
          near={state.near}
          far={state.far}
          fov={state.fov}
        />
      ) : (
        <OrthographicCamera key="orthographic" manual makeDefault />
      )}
      <SceneCameraSync key={state.type} state={state} />
      <SceneCameraTransformGizmo
        sceneId={sceneId}
        activeId={activeId}
        locked={state.locked}
      />
    </>
  );
}

export function SceneCanvas() {
  const meshes = useSceneStore((s) => s.scene?.meshes);
  const camera = useSceneStore((s) => s.scene?.camera);
  const sceneId = useSceneStore((s) => s.scene?.id);
  const backgroundColor = useSceneStore(
    (s) => s.scene?.environment.backgroundColor ?? null
  );
  const activeId = useSessionStore((s) => s.activeObjectId);

  if (!meshes || !camera || !sceneId) return null;

  return (
    <div className={styles.canvas}>
      <Canvas>
        <SceneBackground color={backgroundColor} />
        <SceneCameraRig state={camera} sceneId={sceneId} activeId={activeId} />
        <SceneLights activeId={activeId} />
        {meshes.map((mesh) => (
          <SceneObjectMesh
            key={mesh.id}
            object={mesh}
            isActive={activeId === mesh.id}
          />
        ))}
      </Canvas>
      <AspectPreviewOutline
        enabled={camera.aspectPreviewEnabled}
        aspect={camera.aspect}
      />
    </div>
  );
}
