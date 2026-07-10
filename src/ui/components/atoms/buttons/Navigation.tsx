import type { Dispatch, SetStateAction } from "react";
import { NavLinkButton } from "./Button";
import type { PanelMode } from "../../types/panel";
import clsx from "clsx";

import styles from "./Navigation.module.scss";
import ArrowL from "@/assets/images/icons/descriptive/arrowL.svg?react";
import ArrowR from "@/assets/images/icons/descriptive/arrowR.svg?react";

export function PanelModeToggle({
  mode,
  panel,
  text,
  setMode,
}: {
  mode: PanelMode;
  panel: "Left" | "Right";
  text: string;
  setMode: Dispatch<SetStateAction<PanelMode>>;
}) {
  let CloseArrow, OpenArrow;
  if (panel == "Left") {
    CloseArrow = ArrowL;
    OpenArrow = ArrowR;

    return (
      <div className={styles.modeToggle}>
        <button
          className={styles.modeToggleButton}
          onClick={() => {
            mode == "open" ? setMode("close") : setMode("open");
          }}
        >
          {mode == "open" ? <CloseArrow /> : <OpenArrow />}
        </button>
        <h2
          className={clsx("h2", styles.modeToggleText, {
            [styles.hide]: mode == "close",
          })}
        >
          {text}
        </h2>
      </div>
    );
  } else {
    CloseArrow = ArrowR;
    OpenArrow = ArrowL;

    return (
      <div className={styles.modeToggle}>
        <h2
          className={clsx("h2", styles.modeToggleText, {
            [styles.hide]: mode == "close",
          })}
        >
          {text}
        </h2>
        <button
          className={styles.modeToggleButton}
          onClick={() => {
            mode == "open" ? setMode("close") : setMode("open");
          }}
        >
          {mode == "open" ? <CloseArrow /> : <OpenArrow />}
        </button>
      </div>
    );
  }
}

export function NavTitle({ title, to }: { title: string; to: string }) {
  return (
    <div>
      <NavLinkButton to={to} />
      {title}
    </div>
  );
}
