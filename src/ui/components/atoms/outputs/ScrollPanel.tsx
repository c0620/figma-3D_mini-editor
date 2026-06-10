import { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";

import styles from "./ScrollPanel.module.scss";
import clsx from "clsx";

export function ScrollPanel({
  isLong,
  text,
  img,
  children,
}: {
  isLong: Boolean;
  text?: string;
  img?: string;
  children: any;
}) {
  const mode = useContext(PanelSceneModeContext);

  return (
    <>
      {text && (
        <h3 className={clsx("h3", { [styles.hide]: mode == "close" })}>
          {text}
        </h3>
      )}
      {img && (
        <img
          src={img}
          className={clsx(styles.titleImg, { [styles.hide]: mode == "open" })}
        />
      )}

      <div
        className={clsx(styles.scrollPanel, {
          [styles.panelLong]: isLong,
          [styles.closed]: mode == "close",
        })}
      >
        {children}
      </div>
    </>
  );
}
