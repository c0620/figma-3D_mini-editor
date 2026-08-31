import { NavLinkButton } from "./Button";
import clsx from "clsx";

import styles from "./Navigation.module.scss";
import ArrowL from "@/assets/images/icons/descriptive/arrowL.svg?react";
import ArrowR from "@/assets/images/icons/descriptive/arrowR.svg?react";

export function PanelModeToggle({
  isOpen,
  panel,
  text,
  onToggle,
}: {
  isOpen: boolean;
  panel: "Left" | "Right";
  text: string;
  onToggle: () => void;
}) {
  const isLeft = panel == "Left";
  const CloseArrow = isLeft ? ArrowL : ArrowR;
  const OpenArrow = isLeft ? ArrowR : ArrowL;
  const button = (
    <button className={styles.modeToggleButton} onClick={onToggle}>
      {isOpen ? <CloseArrow /> : <OpenArrow />}
    </button>
  );
  const title = (
    <h2
      className={clsx("h2", styles.modeToggleText, {
        [styles.hide]: !isOpen,
      })}
    >
      {text}
    </h2>
  );

  return (
    <div className={styles.modeToggle}>
      {isLeft ? (
        <>
          {button}
          {title}
        </>
      ) : (
        <>
          {title}
          {button}
        </>
      )}
    </div>
  );
}

export function NavTitle({ title, to }: { title: string; to: string }) {
  return (
    <div className={styles.navTitle}>
      <NavLinkButton to={to} Img={ArrowL} />
      <h1>{title}</h1>
    </div>
  );
}
