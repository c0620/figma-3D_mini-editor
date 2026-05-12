import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSceneStore } from "../../../store/sceneStore";
import { threeAssetRegistry } from "../../../io/threeAssetRegistry";
import type { SceneObject } from "../../../types/scene";

function SceneObjectMesh({ object }: { object: SceneObject }) {
  const asset = threeAssetRegistry.get(object.id);
  if (!asset) return null;

  return (
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
    />
  );
}

export function SceneRenderer() {
  const scene = useSceneStore((s) => s.scene);
  if (!scene) return null;

  return (
    <div className="canvas" style={{ width: "500px", height: "500px" }}>
      <Canvas camera={{ position: scene.camera.position }}>
        <CameraControls />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {scene.objects.map((obj) => (
          <SceneObjectMesh key={obj.id} object={obj} />
        ))}
      </Canvas>
    </div>
  );
}
