import { useContext } from "react";
import { PanelSceneModeContext } from "../organisms/PanelScene";

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
