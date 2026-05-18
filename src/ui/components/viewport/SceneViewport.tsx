import { CameraControls, Outlines, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../io/threeAssetRegistry";
import type { SceneObject } from "../../../types/scene";
import { useUiStore } from "@/store/uiStore";

function SceneObjectMesh({
  object,
  isActive,
}: {
  object: SceneObject;
  isActive: boolean;
}) {
  const asset = threeAssetRegistry.get(object.id);
  if (!asset) return null;

  return (
    <>
      <mesh
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
  const activeId = useUiStore((s) => s.activeObjectId);
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
