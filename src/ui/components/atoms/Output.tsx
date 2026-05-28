import { useContext, type ReactNode } from "react";
import { PanelSceneModeContext } from "../organisms/PanelScene";
import styles from "./Output.module.css";

export type ScrollPanelVariant = "graph" | "mats" | "textures";

export function TextBlock({
  text,
  textListItems,
  iconSrc,
}: {
  text: string;
  textListItems: Array<string> | null;
  iconSrc?: string;
}) {
  return (
    <div className={styles.textBlock}>
      {iconSrc && <img src={iconSrc} alt="" />}
      <div className="t1">
        {text}{" "}
        {textListItems && (
          <ul>
            {textListItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ScrollPanel({
  variant,
  children,
  fillAvailable = false,
}: {
  variant: ScrollPanelVariant;
  children: ReactNode;
  /** When true (graph only), clip grows to fill remaining panel height */
  fillAvailable?: boolean;
}) {
  const mode = useContext(PanelSceneModeContext);
  const isOpen = mode === "openL" || mode === "openR";

  const fillClass =
    fillAvailable && variant === "graph" && isOpen
      ? "panel-scroll-clip--graph-fill"
      : "";

  const clipClass = isOpen
    ? `panel-scroll-clip panel-scroll-clip--${variant} ${fillClass}`.trim()
    : `panel-scroll-clip panel-scroll-clip--${variant} panel-scroll-clip--collapsed`;

  const scrollClass = isOpen
    ? `panel-scroll panel-scroll--${variant}`
    : "panel-scroll panel-scroll--collapsed";

  return (
    <div className={clipClass}>
      <div className={scrollClass}>{children}</div>
    </div>
  );
}

export function PreviewIcon({ src }: { src: string }) {
  return <img src={src} alt="" />;
}
