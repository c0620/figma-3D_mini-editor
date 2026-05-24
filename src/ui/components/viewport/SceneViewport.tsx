import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { CameraControls, Outlines, TransformControls } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  type Material as ThreeMaterial,
  type Mesh as ThreeMesh,
  type MeshStandardMaterial,
} from "three";
import type { Texture } from "three";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../store/threeAssetRegistry";
import type { Material, SceneMesh } from "../../../types/scene";
import { TextureSlot } from "../../../types/scene";
import { applyStoredTextureSettings } from "../../../io/materialTextureExtractor";
import { useSessionStore } from "@/store/sessionStore";

function hasTextureUrls(mat: Material): boolean {
  return Object.values(mat.textures).some((entry) => entry?.url != null);
}

function importedMaterialHasMaps(materials: ThreeMaterial[]): boolean {
  return materials.some((m) => {
    const s = m as MeshStandardMaterial;
    return !!(
      s.map ||
      s.normalMap ||
      s.roughnessMap ||
      s.metalnessMap ||
      s.emissiveMap
    );
  });
}

function buildTextureUrlMap(mat: Material): Record<string, string> {
  const urls: Record<string, string> = {};
  const base = mat.textures[TextureSlot.BaseColor];
  if (base?.url) urls.map = base.url;
  const normal = mat.textures[TextureSlot.Normal];
  if (normal?.url) urls.normalMap = normal.url;
  const roughness = mat.textures[TextureSlot.Roughness];
  if (roughness?.url) urls.roughnessMap = roughness.url;
  const metalness = mat.textures[TextureSlot.Metalness];
  if (metalness?.url) urls.metalnessMap = metalness.url;
  const emissive = mat.textures[TextureSlot.Emissive];
  if (emissive?.url) urls.emissiveMap = emissive.url;
  return urls;
}

function SolidMaterial({ mat, attach }: { mat: Material; attach: string }) {
  return (
    <meshStandardMaterial
      attach={attach}
      color={mat.baseColor}
      roughness={mat.roughness}
      metalness={mat.metalness}
      emissive={mat.emissive}
    />
  );
}

type LoadedTextureMaps = {
  map?: Texture;
  normalMap?: Texture;
  roughnessMap?: Texture;
  metalnessMap?: Texture;
  emissiveMap?: Texture;
};

function TexturedMaterial({
  mat,
  urls,
  attach,
}: {
  mat: Material;
  urls: Record<string, string>;
  attach: string;
}) {
  const maps = useTexture(urls) as LoadedTextureMaps;

  useLayoutEffect(() => {
    applyStoredTextureSettings(maps.map, mat.textures[TextureSlot.BaseColor]);
    applyStoredTextureSettings(
      maps.normalMap,
      mat.textures[TextureSlot.Normal]
    );
    applyStoredTextureSettings(
      maps.roughnessMap,
      mat.textures[TextureSlot.Roughness]
    );
    applyStoredTextureSettings(
      maps.metalnessMap,
      mat.textures[TextureSlot.Metalness]
    );
    applyStoredTextureSettings(
      maps.emissiveMap,
      mat.textures[TextureSlot.Emissive]
    );
  }, [maps, mat.textures]);

  return (
    <meshStandardMaterial
      attach={attach}
      color={mat.baseColor}
      roughness={mat.roughness}
      metalness={mat.metalness}
      emissive={mat.emissive}
      map={maps.map}
      normalMap={maps.normalMap}
      roughnessMap={maps.roughnessMap}
      metalnessMap={maps.metalnessMap}
      emissiveMap={maps.emissiveMap}
    />
  );
}

/** Один слот в массиве материалов меша (или единственный материал). */
function MaterialSlot({ mat, attach }: { mat: Material; attach: string }) {
  const textureUrls = useMemo(() => buildTextureUrlMap(mat), [mat.textures]);

  if (!hasTextureUrls(mat)) {
    return <SolidMaterial mat={mat} attach={attach} />;
  }

  return (
    <Suspense fallback={<SolidMaterial mat={mat} attach={attach} />}>
      <TexturedMaterial
        key={JSON.stringify(textureUrls)}
        mat={mat}
        urls={textureUrls}
        attach={attach}
      />
    </Suspense>
  );
}

/** Материалы из `scene.materials` (источник истины для текстур). */
function ObjectMaterial({ mats }: { mats: Material[] }) {
  if (mats.length === 1) {
    return <MaterialSlot mat={mats[0]} attach="material" />;
  }
  return (
    <>
      {mats.map((mat, i) => (
        <MaterialSlot key={mat.id} mat={mat} attach={`material-${i}`} />
      ))}
    </>
  );
}

function SceneObjectMesh({
  object,
  isActive,
}: {
  object: SceneMesh;
  isActive: boolean;
}) {
  const meshRef = useRef<ThreeMesh>(null);

  const materials = useSceneStore(
    useShallow((s) => {
      const scene = s.scene;
      if (!scene) return null;
      const resolved = object.materialIDs.map((id) => scene.materials[id]);
      return resolved.every(Boolean) ? (resolved as Material[]) : null;
    })
  );

  const asset = threeAssetRegistry.get(object.id);
  const importedMaterials = asset?.importedMaterials;

  const useImportedRender =
    importedMaterials != null &&
    importedMaterialHasMaps(importedMaterials);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !useImportedRender || !importedMaterials?.length) return;

    mesh.material =
      importedMaterials.length === 1 ? importedMaterials[0] : importedMaterials;
  }, [useImportedRender, importedMaterials]);

  if (!asset || !materials) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={asset.geometry}
      position={object.transform.position}
      rotation={object.transform.rotation}
      scale={object.transform.scale}
      visible={object.visible}
      name={object.name}
    >
      {!useImportedRender && <ObjectMaterial mats={materials} />}
      {isActive && <Outlines thickness={3} color="orange" />}
    </mesh>
  );
}

export function SceneCanvas() {
  const scene = useSceneStore((s) => s.scene);
  const activeId = useSessionStore((s) => s.activeObjectId);
  if (!scene) return null;

  return (
    <div className="canvas" style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: scene.camera.transform.position }}>
        <CameraControls makeDefault />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {scene.meshes.map((mesh) =>
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
