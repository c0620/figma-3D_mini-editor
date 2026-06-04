import type { Dispatch, SetStateAction } from "react";
import { NavLinkButton } from "./Button";
import type { PanelMode } from "../types/panel";
import clsx from "clsx";

import styles from "./Navigation.module.scss";
import arrowL from "@/assets/images/icons/descriptive/arrowL.svg";
import arrowR from "@/assets/images/icons/descriptive/arrowR.svg";

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
  var closeArrow, openArrow;
  if (panel == "Left") {
    closeArrow = arrowL;
    openArrow = arrowR;

    return (
      <div className={styles.modeToggle}>
        <button
          className={styles.modeToggleButton}
          onClick={() => {
            mode == "open" ? setMode("close") : setMode("open");
          }}
        >
          {mode == "open" ? <img src={closeArrow} /> : <img src={openArrow} />}
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
    closeArrow = arrowR;
    openArrow = arrowL;

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
          {mode == "open" ? <img src={closeArrow} /> : <img src={openArrow} />}
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
