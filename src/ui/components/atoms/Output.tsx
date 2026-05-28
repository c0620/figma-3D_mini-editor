import { useContext } from "react";
import { PanelSceneModeContext } from "../organisms/PanelScene";
import styles from "./Output.module.css";

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
      {iconSrc && <img src={iconSrc} />}
      <div className="t1">
        {text}{" "}
        {textListItems && (
          <ul>
            {textListItems.map((item) => (
              <li>• {item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export function ScrollPanel({ children }: { children: any }) {
  const mode = useContext(PanelSceneModeContext);
  if (mode == "openL" || mode == "openR") {
    return (
      <div style={{ backgroundColor: "rgba(34, 34, 34, 1)" }}>
        Open {children}
      </div>
    );
  } else {
    return <div>Close {children}</div>;
  }
}

export function PreviewIcon({ src }: { src: string }) {
  return <img src={src}></img>;
}
