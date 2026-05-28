import { useContext, type ReactNode } from "react";
import {
  isPanelOpen,
  PanelSceneModeContext,
} from "../organisms/PanelScene";
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
  const isOpen = isPanelOpen(mode);
  const isCompact = !isOpen;

  const fillClass =
    fillAvailable && variant === "graph"
      ? "panel-scroll-clip--graph-fill"
      : "";

  const compactClass = isCompact ? "panel-scroll-clip--compact" : "";
  const clipClass =
    `panel-scroll-clip panel-scroll-clip--${variant} ${fillClass} ${compactClass}`.trim();

  const scrollClass = isCompact
    ? `panel-scroll panel-scroll--${variant} panel-scroll--compact`
    : `panel-scroll panel-scroll--${variant}`;

  return (
    <div className={clipClass}>
      <div className={scrollClass}>{children}</div>
    </div>
  );
}

export function PreviewIcon({ src }: { src: string }) {
  return <img src={src} alt="" />;
}
