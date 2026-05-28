import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

import type { PrimitiveKind } from "@/types/assets";
import styles from "./AssetPreviewCanvas.module.css";

function PreviewMesh({ kind }: { kind: PrimitiveKind }) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.55;
      ref.current.rotation.x = 0.25;
    }
  });

  const material = (
    <meshStandardMaterial color="#c8c8c8" metalness={0.85} roughness={0.2} />
  );

  switch (kind) {
    case "box":
      return (
        <mesh ref={ref}>
          <boxGeometry args={[1, 1, 1]} />
          {material}
        </mesh>
      );
    case "sphere":
      return (
        <mesh ref={ref}>
          <sphereGeometry args={[0.6, 32, 32]} />
          {material}
        </mesh>
      );
    case "cylinder":
      return (
        <mesh ref={ref}>
          <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
          {material}
        </mesh>
      );
    case "cone":
      return (
        <mesh ref={ref}>
          <coneGeometry args={[0.5, 1, 32]} />
          {material}
        </mesh>
      );
    case "torus":
      return (
        <mesh ref={ref}>
          <torusGeometry args={[0.45, 0.18, 24, 48]} />
          {material}
        </mesh>
      );
    case "plane":
      return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          {material}
        </mesh>
      );
    case "icosahedron":
      return (
        <mesh ref={ref}>
          <icosahedronGeometry args={[0.65, 0]} />
          {material}
        </mesh>
      );
    case "torusKnot":
      return (
        <mesh ref={ref}>
          <torusKnotGeometry args={[0.45, 0.14, 128, 16]} />
          {material}
        </mesh>
      );
  }
}

export function AssetPreviewCanvas({ kind }: { kind: PrimitiveKind }) {
  return (
    <div className={styles.root}>
      <Canvas
        camera={{ position: [2.2, 1.6, 2.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 6, 5]} intensity={1.1} />
        <PreviewMesh kind={kind} />
      </Canvas>
    </div>
  );
}
