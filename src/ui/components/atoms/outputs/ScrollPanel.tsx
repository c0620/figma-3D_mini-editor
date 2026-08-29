import React, { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";

import styles from "./ScrollPanel.module.scss";
import clsx from "clsx";
import type { IconComponent } from "../../types/icon";

export function ScrollPanel({
  fill = false,
  text,
  img: Icon,
  children,
  disableScroll = true,
}: {
  fill?: boolean;
  text?: string;
  img?: IconComponent;
  children: React.ReactNode;
  disableScroll?: boolean;
}) {
  const mode = useContext(PanelSceneModeContext);
  return (
    <div
      className={clsx(styles.scrollPanelContainer, {
        [styles.closed]: mode == "close",
        [styles.fill]: fill,
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
          [styles.closed]: mode == "close",
          [styles.disableScroll]: disableScroll,
        })}
      >
        {children}
      </div>
    </div>
  );
}
