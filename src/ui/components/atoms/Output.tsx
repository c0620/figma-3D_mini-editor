import { useContext } from "react";
import { PanelSceneModeContext } from "../organisms/panels/BasePanel";

import styles from "./Output.module.scss";
import clsx from "clsx";

export function TextBlock({
  text,
  textListItems,
}: {
  text: string;
  textListItems: Array<string> | null;
}) {
  return (
    <div>
      {text} {textListItems && textListItems.map((item) => <p>{item}</p>)}
    </div>
  );
}
export function ScrollPanel({
  isActive,
  text,
  img,
  children,
}: {
  isActive: Boolean;
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
          [styles.panelLong]: !isActive,
          [styles.closed]: mode == "close",
        })}
      >
        {children}
      </div>
    </>
  );
}
