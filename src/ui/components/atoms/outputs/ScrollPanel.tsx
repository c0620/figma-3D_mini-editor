import { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";

import styles from "./ScrollPanel.module.scss";
import clsx from "clsx";
import type { IconComponent } from "../../types/icon";

export function ScrollPanel({
  isLong,
  text,
  img: Icon,
  children,
  isFixed = false,
}: {
  isLong: Boolean;
  text?: string;
  img?: IconComponent;
  children: any;
  isFixed?: boolean;
}) {
  const mode = useContext(PanelSceneModeContext);
  return (
    <div
      className={clsx(styles.scrollPanelContainer, {
        [styles.closed]: mode == "close",
        [styles.panelFixed]: isFixed,
      })}
    >
      {text && (
        <h3 className={clsx("h3", { [styles.hide]: mode == "close" })}>
          {text}
        </h3>
      )}
      {Icon && (
        <Icon
          className={clsx(styles.titleImg, { [styles.hide]: mode == "open" })}
        />
      )}

      <div
        className={clsx(styles.scrollPanel, {
          [styles.panelLong]: isLong,
          [styles.closed]: mode == "close",
          [styles.panelFixed]: isFixed,
        })}
      >
        {children}
      </div>
    </div>
  );
}
