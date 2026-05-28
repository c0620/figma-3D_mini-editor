import { useHelper } from "@react-three/drei";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { SpotLightHelper } from "three";
import type { Group, Object3D, SpotLight as ThreeSpotLight } from "three";

import { useSceneStore } from "../../../store/sceneStore";
import type { Light } from "../../../types/scene";
import { useThree } from "@react-three/fiber";
import { HdriEnvironment } from "./HdriEnvironment";
import { SceneTransformGizmo } from "./SceneTransformGizmo";

const SELECTION_COLOR = "#ff5900";

function AmbientLightNode({ light }: { light: Light }) {
  return light.visible ? (
    <ambientLight color={light.color} intensity={light.intensity} />
  ) : null;
}

function SceneSpotLightNode({
  light,
  isActive,
}: {
  light: Light;
  isActive: boolean;
}) {
  const { transform, visible } = light;
  const [rx, ry, rz] = transform.rotation;
  const [sx, sy, sz] = transform.scale;
  const groupRef = useRef<Group>(undefined);

  return (
    <>
      <group
        ref={groupRef}
        position={transform.position}
        rotation={[rx, ry, rz]}
        scale={[sx, sy, sz]}
        visible={visible}
      >
        <SpotLightLocal light={light} isActive={isActive} />
      </group>
      <SceneTransformGizmo
        entityId={light.id}
        objectRef={groupRef}
        isActive={isActive}
        locked={light.locked}
        scaleEnabled
      />
    </>
  );
}

function SpotLightLocal({
  light,
  isActive,
}: {
  light: Light;
  isActive: boolean;
}) {
  const lightRef = useRef<ThreeSpotLight>(undefined);
  const { scene } = useThree();
  const [tx, ty, tz] = light.target;

  useHelper(
    isActive ? (lightRef as RefObject<Object3D>) : false,
    SpotLightHelper,
    SELECTION_COLOR
  );

  useLayoutEffect(() => {
    const spot = lightRef.current;
    if (!spot) return;

    spot.target.position.set(tx, ty, tz);
    scene.add(spot.target);

    return () => {
      scene.remove(spot.target);
    };
  }, [scene, tx, ty, tz]);

  return (
    <spotLight
      ref={lightRef}
      color={light.color}
      intensity={light.intensity}
      distance={light.distance}
      penumbra={light.penumbra}
      angle={light.angle}
    />
  );
}

export function SceneLights({ activeId }: { activeId: string | null }) {
  const lights = useSceneStore((s) => s.scene?.lights ?? []);

  const visibleLights = lights.filter((l) => l.visible && !l.pendingDelete);
  const hdriLight = visibleLights.find((l) => l.type === "HDRI");

  return (
    <>
      {hdriLight ? (
        <HdriEnvironment
          preset={hdriLight.hdriPreset}
          intensity={hdriLight.intensity}
        />
      ) : null}
      {lights.map((light) => {
        if (light.pendingDelete) return null;

        if (light.type === "Ambient") {
          return <AmbientLightNode key={light.id} light={light} />;
        }

        if (light.type === "Spot") {
          return (
            <SceneSpotLightNode
              key={light.id}
              light={light}
              isActive={activeId === light.id}
            />
          );
        }

        return null;
      })}
    </>
  );
}
