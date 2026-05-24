import { Suspense, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { CameraControls, Outlines, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../store/threeAssetRegistry";
import type { Material, SceneMesh } from "../../../types/scene";
import { resolveEmissiveForRender } from "../../../render/domainMaterialBuilder";
import { useSessionStore } from "@/store/sessionStore";
import { useMaterialGpuTextures } from "./useMaterialGpuTextures";

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

function TexturedMaterialSlot({ mat, attach }: { mat: Material; attach: string }) {
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
  const meshState = useSceneStore(
    useShallow((s) => {
      const mesh = s.scene?.meshes.find((m) => m.id === object.id);
      if (!mesh) return null;
      return {
        transform: mesh.transform,
        visible: mesh.visible,
        materialIDs: mesh.materialIDs,
        name: mesh.name,
      };
    })
  );

  const asset = threeAssetRegistry.get(object.id);

  if (!asset || !meshState) return null;

  const { transform, visible, materialIDs, name } = meshState;

  return (
    <mesh
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
          attach={
            materialIDs.length === 1 ? "material" : `material-${index}`
          }
        />
      ))}
      {isActive && <Outlines thickness={3} color="orange" />}
    </mesh>
  );
}

export function SceneCanvas() {
  const meshes = useSceneStore((s) => s.scene?.meshes);
  const cameraPosition = useSceneStore(
    (s) => s.scene?.camera.transform.position
  );
  const activeId = useSessionStore((s) => s.activeObjectId);

  if (!meshes || !cameraPosition) return null;

  return (
    <div className="canvas" style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: cameraPosition }}>
        <CameraControls makeDefault />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {meshes.map((mesh) =>
          activeId === mesh.id && !mesh.locked ? (
            <TransformControls key={mesh.id}>
              <SceneObjectMesh object={mesh} isActive={activeId === mesh.id} />
            </TransformControls>
          ) : (
            <SceneObjectMesh
              key={mesh.id}
              object={mesh}
              isActive={activeId === mesh.id}
            />
          )
        )}
      </Canvas>
    </div>
  );
}
