import { Suspense, useMemo } from "react";
import { CameraControls, Outlines, TransformControls } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { Texture } from "three";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../store/threeAssetRegistry";
import type { Material, SceneObject } from "../../../types/scene";
import { TextureSlot } from "../../../types/scene";
import { useSessionStore } from "@/store/sessionStore";

function hasTextureUrls(mat: Material): boolean {
  return Object.values(mat.textures).some((url) => url != null);
}

function buildTextureUrlMap(mat: Material): Record<string, string> {
  const urls: Record<string, string> = {};
  if (mat.textures[TextureSlot.BaseColor]) {
    urls.map = mat.textures[TextureSlot.BaseColor]!;
  }
  if (mat.textures[TextureSlot.Normal]) {
    urls.normalMap = mat.textures[TextureSlot.Normal]!;
  }
  if (mat.textures[TextureSlot.Roughness]) {
    urls.roughnessMap = mat.textures[TextureSlot.Roughness]!;
  }
  if (mat.textures[TextureSlot.Metalness]) {
    urls.metalnessMap = mat.textures[TextureSlot.Metalness]!;
  }
  if (mat.textures[TextureSlot.Emissive]) {
    urls.emissiveMap = mat.textures[TextureSlot.Emissive]!;
  }
  return urls;
}

function SolidMaterial({ mat }: { mat: Material }) {
  return (
    <meshStandardMaterial
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
}: {
  mat: Material;
  urls: Record<string, string>;
}) {
  const maps = useTexture(urls) as LoadedTextureMaps;

  return (
    <meshStandardMaterial
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

/** Материал из доменного стора; при смене textures / baseColor React пересобирает meshStandardMaterial. */
function ObjectMaterial({ mat }: { mat: Material }) {
  const textureUrls = useMemo(() => buildTextureUrlMap(mat), [mat.textures]);

  if (!hasTextureUrls(mat)) {
    return <SolidMaterial mat={mat} />;
  }

  return (
    <Suspense fallback={<SolidMaterial mat={mat} />}>
      <TexturedMaterial
        key={JSON.stringify(textureUrls)}
        mat={mat}
        urls={textureUrls}
      />
    </Suspense>
  );
}

function SceneObjectMesh({
  object,
  isActive,
}: {
  object: SceneObject;
  isActive: boolean;
}) {
  const material = useSceneStore((s) => s.scene?.materials[object.materialId]);
  const asset = threeAssetRegistry.get(object.id);
  if (!asset || !material) return null;

  return (
    <mesh
      geometry={asset.geometry}
      position={object.transform.position}
      rotation={object.transform.rotation}
      scale={object.transform.scale}
      visible={object.visible}
      name={object.name}
    >
      <ObjectMaterial mat={material} />
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
        {scene.objects.map((obj) =>
          activeId === obj.id ? (
            <TransformControls key={obj.id}>
              <SceneObjectMesh object={obj} isActive />
            </TransformControls>
          ) : (
            <SceneObjectMesh key={obj.id} object={obj} isActive={false} />
          )
        )}
      </Canvas>
    </div>
  );
}
