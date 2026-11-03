import { Torus } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import { NavLink } from "react-router";
import type { Mesh } from "three";
import styles from "./CardStart.module.scss";
import { ButtonLink } from "@atoms/buttons/ButtonLink";
import arrow from "@images/icons/descriptive/arrowR.svg?react";
import clsx from "clsx";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cursor = cursorRef.current;
    const button = buttonRef.current;
    if (!cursor || !container || !button) return;

    const removeCursor = (e: MouseEvent) => {
      cursor.classList.add(styles.hide);
    };

    const setCursor = (e: MouseEvent) => {
      cursor.classList.remove(styles.hide);

      const position = container.getBoundingClientRect();
      const cursorX = e.clientX - position.left;
      const cursorY = e.clientY - position.top;

      cursor.style.top = cursorY + "px";
      cursor.style.left = cursorX + "px";

      const buttonPosition = button.getBoundingClientRect();

      const overButton =
        e.clientX > buttonPosition.left &&
        e.clientX < buttonPosition.right &&
        e.clientY > buttonPosition.top &&
        e.clientY < buttonPosition.bottom;
      if (overButton) cursor.style.zIndex = "-1";
      else cursor.style.zIndex = "1";
    };
    container.addEventListener("mouseenter", setCursor);
    container.addEventListener("mousemove", setCursor);
    container.addEventListener("mouseleave", removeCursor);
    return () => {
      container.removeEventListener("mouseenter", setCursor);
      container.removeEventListener("mousemove", setCursor);
      container.removeEventListener("mouseleave", removeCursor);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={cursorRef} className={clsx(styles.cursor)} />
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{text}</p>
      </div>

      <img className={styles.image} src={image} />
      <div ref={buttonRef} className={styles.button}>
        <ButtonLink to={to} Img={arrow} />
      </div>
    </div>
  );
}
