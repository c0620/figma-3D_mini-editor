import { NavLink } from "react-router";
import { ActionButton } from "../../atoms/buttons/Button";
import styles from "./Cards.module.scss";
import { Tag } from "../../atoms/outputs/Tag";
import { Canvas, useFrame } from "@react-three/fiber";
import { Torus } from "@react-three/drei";
import { useRef, useState } from "react";
import { Mesh, Object3D } from "three";

export type CardAsset = {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
};

export function CardStart({
  title,
  text,
  image,
  to,
}: {
  title: string;
  text: string;
  image: string;
  to: string;
}) {
  return (
    <div>
      <h3>{title}</h3>
      <div>{text}</div>
      <img src={image}></img>
      <NavLink to={to}>Загрузить</NavLink>
    </div>
  );
}

function Asset() {
  const torus = useRef<Mesh | null>(null);
  useFrame((state, delta) => {
    if (torus.current) {
      torus.current.rotateY(delta);
    }
  });
  return <Torus ref={torus}></Torus>;
}

export function CardAsset({
  card,
  toggleActiveID,
  onClick,
  isActive,
}: {
  card: CardAsset;
  toggleActiveID: (id: string | null) => void;
  onClick: () => void;
  isActive: boolean;
}) {
  const slotRef = useRef(null);
  return (
    <div
      className={styles.cardAsset}
      onMouseEnter={() => toggleActiveID(card.id)}
      onMouseLeave={() => toggleActiveID(null)}
    >
      <Tag text={card.tag} />

      {isActive ? (
        <Canvas>
          <Torus />
        </Canvas>
      ) : (
        <img src={card.image} />
      )}
      <h2>{card.tag}</h2>
      <p>{card.description}</p>
      <ActionButton text="Добавить в сцену" onClick={onClick} />
    </div>
  );
}
