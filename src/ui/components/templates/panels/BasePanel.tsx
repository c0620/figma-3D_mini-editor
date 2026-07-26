import { useState, createContext } from "react";
import type { PanelMode } from "../../types/panel";
import styles from "./Panel.module.scss";
import { PanelModeToggle } from "../../atoms/buttons/Navigation";
import clsx from "clsx";

export const PanelSceneModeContext = createContext<PanelMode>("open");

export function Panel({
  panel,
  text,
  children,
  spaceBetween = false,
}: {
  panel: "Left" | "Right";
  text: string;
  children: React.ReactNode;
  spaceBetween?: boolean;
}) {
  const [mode, setMode] = useState<PanelMode>("open");
  return (
    <div
      className={clsx(styles.panel, {
        [styles.close]: mode == "close",
        [styles.spaceBetween]: spaceBetween,
      })}
    >
      <PanelSceneModeContext value={mode}>
        <PanelModeToggle
          mode={mode}
          setMode={setMode}
          panel={panel}
          text={text}
        />
        {children}
      </PanelSceneModeContext>
    </div>
  );
}
